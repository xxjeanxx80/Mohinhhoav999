import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Spa } from '../spas/entities/spa.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../users/entities/user.entity';
import { Loyalty } from '../users/entities/loyalty.entity';
import { LoyaltyHistory } from '../users/entities/loyalty-history.entity';
import { LoyaltyRank } from '../users/enums/loyalty-rank.enum';
import { Payment, PaymentMethod, PaymentStatus } from '../payments/entities/payment.entity';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private readonly commissionRate = 0.15;

  constructor(
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
    @InjectRepository(SpaService) private readonly spaServiceRepository: Repository<SpaService>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Staff) private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Loyalty) private readonly loyaltyRepository: Repository<Loyalty>,
    @InjectRepository(LoyaltyHistory) private readonly loyaltyHistoryRepository: Repository<LoyaltyHistory>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.dataSource.transaction(async (manager) => {
      const spa = await manager.findOne(Spa, { where: { id: dto.spaId, isApproved: true } });
      if (!spa) {
        throw new NotFoundException('Spa not found or not approved.');
      }

      const service = await manager.findOne(SpaService, { 
        where: { id: dto.serviceId, spa: { id: spa.id } },
        relations: ['spa']
      });
      if (!service) {
        throw new NotFoundException('Service not found for spa.');
      }

      const customer = await manager.findOne(User, { where: { id: dto.customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found.');
      }

      let staff: Staff | null = null;
      if (dto.staffId) {
        staff = await manager.findOne(Staff, { 
          where: { id: dto.staffId, spa: { id: spa.id }, isActive: true },
          relations: ['spa']
        });
        if (!staff) {
          throw new NotFoundException('Staff member not available.');
        }
      } else {
        staff = await manager.findOne(Staff, { 
          where: { spa: { id: spa.id }, isActive: true },
          relations: ['spa']
        });
      }

      const servicePrice = Number(service.price);
      let discountPercent = 0;

      if (dto.couponCode) {
        const coupon = await manager.findOne(Coupon, { where: { code: dto.couponCode } });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestException('Coupon is not available.');
        }

        if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
          throw new BadRequestException('Coupon expired.');
        }

        if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
          throw new BadRequestException('Coupon redemption limit reached.');
        }

        coupon.currentRedemptions += 1;
        await manager.save(Coupon, coupon);
        discountPercent = Number(coupon.discountPercent);
      }

      const finalPrice = this.applyDiscount(servicePrice, discountPercent);
      const commissionAmount = this.calculateCommission(finalPrice);

      const bookingEntity = manager.create(Booking, {
        spa,           // ✅ TypeORM will auto-set spa_id
        service,       // ✅ TypeORM will auto-set service_id
        customer,      // ✅ TypeORM will auto-set customer_id
        staff,         // ✅ TypeORM will auto-set staff_id (nullable)
        scheduledAt: new Date(dto.scheduledAt),
        status: BookingStatus.PENDING,  // Changed to PENDING initially
        couponCode: dto.couponCode ?? null,
        totalPrice: servicePrice,
        finalPrice,
        commissionAmount,
      });

      const savedBooking = await manager.save(bookingEntity);

      // Create payment record
      let commissionRate = 15; // Default 15%
      try {
        const commissionSetting = await this.systemSettingsService.findOne('commission_rate');
        commissionRate = parseFloat(commissionSetting?.data?.value || '15');
      } catch {
        // Use default if setting not found
        commissionRate = 15;
      }

      const paymentMethod = dto.paymentMethod || PaymentMethod.CASH;
      
      // Generate transaction reference for non-cash payments
      let transactionReference: string | null = null;
      if (paymentMethod !== PaymentMethod.CASH) {
        // Format: TXN-{bookingId}-{timestamp}
        const timestamp = Date.now();
        transactionReference = `TXN-${savedBooking.id}-${timestamp}`;
      }

      const paymentEntity = manager.create(Payment, {
        bookingId: savedBooking.id,
        amount: finalPrice,
        method: paymentMethod,
        status: PaymentStatus.COMPLETED, // Payment is completed when booking is created
        commissionPercent: commissionRate,
        commissionAmount,
        transactionReference,
      });

      await manager.save(paymentEntity);

      return savedBooking;
    });

    return new ApiResponseDto({ success: true, message: 'Booking confirmed.', data: booking });
  }

  async findAll() {
    const bookings = await this.bookingRepository.find({
      relations: ['spa', 'service', 'customer', 'staff', 'feedbacks'],
      order: { createdAt: 'DESC' }
    });
    return new ApiResponseDto({ success: true, message: 'Bookings retrieved.', data: bookings });
  }

  async findByUser(userId?: number) {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    const bookings = await this.bookingRepository.find({
      where: { customer: { id: userId } },
      relations: ['spa', 'service', 'customer', 'staff', 'feedbacks'],
      order: { createdAt: 'DESC' }
    });
    return new ApiResponseDto({ success: true, message: 'User bookings retrieved.', data: bookings });
  }

  async findByOwner(ownerId: number) {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.staff', 'staff')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('booking.scheduledAt', 'DESC')
      .getMany();
    return new ApiResponseDto({ success: true, message: 'Owner bookings retrieved.', data: bookings });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.spa', 'spa')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.staff', 'staff')
      .where('booking.id = :id', { id })
      .getOne();
    
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Booking retrieved.', data: booking });
  }

  async reschedule(id: number, dto: RescheduleBookingDto) {
    const booking = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Booking, { where: { id } });
      if (!existing) {
        throw new NotFoundException('Booking not found.');
      }

      existing.scheduledAt = new Date(dto.scheduledAt);
      existing.status = BookingStatus.CONFIRMED;
      return manager.save(existing);
    });

    return new ApiResponseDto({ success: true, message: 'Booking rescheduled.', data: booking });
  }

  async cancel(id: number, dto: CancelBookingDto) {
    const booking = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Booking, { where: { id } });
      if (!existing) {
        throw new NotFoundException('Booking not found.');
      }

      existing.status = BookingStatus.CANCELLED;
      return manager.save(existing);
    });

    return new ApiResponseDto({ success: true, message: 'Booking cancelled.', data: booking });
  }

  async updateStatus(id: number, dto: { status: BookingStatus }) {
    const booking = await this.bookingRepository.findOne({ 
      where: { id },
      relations: ['customer'] 
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const oldStatus = booking.status;
    booking.status = dto.status;
    const updated = await this.bookingRepository.save(booking);

    // Auto +10 points khi booking COMPLETED
    if (dto.status === BookingStatus.COMPLETED && oldStatus !== BookingStatus.COMPLETED && booking.customer) {
      await this.addLoyaltyPoints(booking.customer.id, 10, `Booking #${id} completed`);
    }

    return new ApiResponseDto({ 
      success: true, 
      message: `Booking status updated to ${dto.status}.`, 
      data: updated 
    });
  }

  private async addLoyaltyPoints(userId: number, points: number, reason: string) {
    try {
      let loyalty = await this.loyaltyRepository.findOne({ where: { userId } });
      
      if (!loyalty) {
        loyalty = this.loyaltyRepository.create({ 
          userId, 
          points: 0, 
          rank: LoyaltyRank.BRONZE 
        });
      }

      loyalty.points += points;
      loyalty.rank = this.determineRank(loyalty.points);
      
      await this.loyaltyRepository.save(loyalty);
      
      // Save history
      const history = this.loyaltyHistoryRepository.create({
        userId,
        points,
        reason,
      });
      await this.loyaltyHistoryRepository.save(history);
    } catch (error) {
      this.logger.error('Failed to add loyalty points', error instanceof Error ? error.stack : String(error));
      // Don't throw error, just log it
    }
  }

  private determineRank(points: number): LoyaltyRank {
    if (points >= 300) return LoyaltyRank.PLATINUM;
    if (points >= 200) return LoyaltyRank.GOLD;
    if (points >= 100) return LoyaltyRank.SILVER;
    return LoyaltyRank.BRONZE;
  }

  private applyDiscount(amount: number, percent: number) {
    if (!percent) {
      return Number(amount.toFixed(2));
    }

    const discounted = amount * ((100 - percent) / 100);
    return Number(discounted.toFixed(2));
  }

  private calculateCommission(amount: number) {
    return Number((amount * this.commissionRate).toFixed(2));
  }
}
