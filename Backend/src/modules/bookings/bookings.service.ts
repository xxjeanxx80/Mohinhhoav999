import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationChannel } from '../notifications/entities/notification.entity';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  private readonly DEFAULT_COMMISSION_RATE = 0.15;

  constructor(
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Spa) private readonly spaRepo: Repository<Spa>,
    @InjectRepository(SpaService) private readonly serviceRepo: Repository<SpaService>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Loyalty) private readonly loyaltyRepo: Repository<Loyalty>,
    @InjectRepository(LoyaltyHistory) private readonly loyaltyHistoryRepo: Repository<LoyaltyHistory>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Coupon) private readonly couponRepo: Repository<Coupon>,
    private readonly dataSource: DataSource,
    private readonly systemSettings: SystemSettingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== CREATE ====================
  async create(dto: CreateBookingDto) {
    const booking = await this.dataSource.transaction(async (manager) => {
      // Validate entities
      const spa = await manager.findOne(Spa, { where: { id: dto.spaId, isApproved: true } });
      if (!spa) throw new NotFoundException('Spa not found or not approved.');

      const service = await manager.findOne(SpaService, { 
        where: { id: dto.serviceId, spa: { id: spa.id } },
        relations: ['spa']
      });
      if (!service) throw new NotFoundException('Service not found for spa.');

      const customer = await manager.findOne(User, { where: { id: dto.customerId } });
      if (!customer) throw new NotFoundException('Customer not found.');

      // Find available staff
      const staff = await this.findAvailableStaff(manager, spa.id, dto.staffId, new Date(dto.scheduledAt));

      // Apply coupon if provided
      const { finalPrice, discountPercent } = await this.applyCoupon(manager, Number(service.price), dto.couponCode ?? undefined);
      const commissionAmount = this.calculateCommission(finalPrice);

      // Create booking
      const bookingEntity = manager.create(Booking, {
        spa, service, customer, staff,
        scheduledAt: new Date(dto.scheduledAt),
        status: BookingStatus.PENDING,
        couponCode: dto.couponCode ?? null,
        totalPrice: Number(service.price),
        finalPrice,
        commissionAmount,
      });
      const savedBooking = await manager.save(bookingEntity);

      // Create payment
      await this.createPayment(manager, savedBooking.id, finalPrice, commissionAmount, dto.paymentMethod);

      return savedBooking;
    });

    // Send notification to customer
    if (dto.customerId) {
      await this.sendNotification(
        dto.customerId,
        `Your booking #${booking.id} has been confirmed successfully!`,
        { bookingId: booking.id, type: 'BOOKING_CREATED' }
      );
    }

    return new ApiResponseDto({ success: true, message: 'Booking confirmed.', data: booking });
  }

  // ==================== READ ====================
  async findAll() {
    const bookings = await this.bookingRepo.find({
      relations: ['spa', 'service', 'customer', 'staff', 'feedbacks'],
      order: { createdAt: 'DESC' }
    });
    return new ApiResponseDto({ success: true, message: 'Bookings retrieved.', data: bookings });
  }

  async findByUser(userId?: number) {
    if (!userId) throw new BadRequestException('User ID is required.');
    
    const bookings = await this.bookingRepo.find({
      where: { customer: { id: userId } },
      relations: ['spa', 'service', 'customer', 'staff', 'feedbacks'],
      order: { createdAt: 'DESC' }
    });
    return new ApiResponseDto({ success: true, message: 'User bookings retrieved.', data: bookings });
  }

  async findByOwner(ownerId: number) {
    const bookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.staff', 'staff')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('booking.id', 'DESC')
      .getMany();
    
    return new ApiResponseDto({ success: true, message: 'Owner bookings retrieved.', data: bookings });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['spa', 'service', 'customer', 'staff']
    });
    if (!booking) throw new NotFoundException('Booking not found.');
    
    return new ApiResponseDto({ success: true, message: 'Booking retrieved.', data: booking });
  }

  // ==================== UPDATE ====================
  async reschedule(id: number, dto: RescheduleBookingDto, userId?: number) {
    const booking = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Booking, { where: { id }, relations: ['customer'] });
      if (!existing) throw new NotFoundException('Booking not found.');

      const newDate = new Date(dto.scheduledAt);
      if (isNaN(newDate.getTime())) throw new BadRequestException('Invalid date format.');
      if (newDate <= new Date()) throw new BadRequestException('New date must be in the future.');

      // Customer requests reschedule (needs approval), Owner/Admin reschedules directly
      if (userId && existing.customer.id === userId) {
        existing.requestedScheduledAt = newDate;
      } else {
        existing.scheduledAt = newDate;
        existing.requestedScheduledAt = null;
      }

      return manager.save(existing);
    });

    const isCustomerRequest = userId && booking.customer?.id === userId;
    return new ApiResponseDto({ 
      success: true, 
      message: isCustomerRequest ? 'Reschedule request sent.' : 'Booking rescheduled.',
      data: booking 
    });
  }

  async respondToReschedule(id: number, approved: boolean, ownerId: number) {
    const booking = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Booking, { 
        where: { id },
        relations: ['spa', 'spa.owner']
      });
      if (!existing) throw new NotFoundException('Booking not found.');
      if (existing.spa.owner.id !== ownerId) throw new ForbiddenException('Not authorized.');
      if (!existing.requestedScheduledAt) throw new BadRequestException('No pending reschedule request.');

      if (approved) {
        existing.scheduledAt = existing.requestedScheduledAt;
      }
      existing.requestedScheduledAt = null;

      return manager.save(existing);
    });

    return new ApiResponseDto({
      success: true,
      message: approved ? 'Reschedule approved.' : 'Reschedule rejected.',
      data: booking
    });
  }

  async cancel(id: number, dto: CancelBookingDto) {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['customer'] });
    if (!booking) throw new NotFoundException('Booking not found.');

    booking.status = BookingStatus.CANCELLED;
    const updated = await this.bookingRepo.save(booking);

    // Send notification to customer about cancellation
    if (booking.customer?.id) {
      await this.sendNotification(
        booking.customer.id,
        `Your booking #${id} has been cancelled.`,
        { bookingId: id, type: 'BOOKING_CANCELLED' }
      );
    }

    return new ApiResponseDto({ success: true, message: 'Booking cancelled.', data: updated });
  }

  async updateStatus(id: number, dto: { status: BookingStatus }) {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['customer'] });
    if (!booking) throw new NotFoundException('Booking not found.');

    const oldStatus = booking.status;
    booking.status = dto.status;
    const updated = await this.bookingRepo.save(booking);

    // Award loyalty points on completion
    if (dto.status === BookingStatus.COMPLETED && oldStatus !== BookingStatus.COMPLETED && booking.customer) {
      await this.addLoyaltyPoints(booking.customer.id, 10, `Booking #${id} completed`);
    }

    // Send notification to customer about status change
    if (booking.customer?.id) {
      const statusMessages: Record<string, string> = {
        [BookingStatus.CONFIRMED]: `Your booking #${id} has been confirmed by the spa!`,
        [BookingStatus.COMPLETED]: `Your booking #${id} is completed. Thank you for using our service!`,
        [BookingStatus.CANCELLED]: `Your booking #${id} has been cancelled.`,
      };
      const message = statusMessages[dto.status] || `Your booking #${id} status has been updated to ${dto.status}.`;
      await this.sendNotification(
        booking.customer.id,
        message,
        { bookingId: id, type: 'BOOKING_STATUS_CHANGED', status: dto.status }
      );
    }

    return new ApiResponseDto({ success: true, message: `Status updated to ${dto.status}.`, data: updated });
  }

  // ==================== STAFF AVAILABILITY ====================
  async getAvailableStaff(spaId: number, scheduledAt: string) {
    const spa = await this.spaRepo.findOne({ where: { id: spaId } });
    if (!spa) throw new NotFoundException('Spa not found.');

    const bookingDate = new Date(scheduledAt);
    const allStaff = await this.staffRepo.find({
      where: { spa: { id: spaId }, isActive: true },
      relations: ['shifts', 'shifts.shiftDays', 'timeOff'],
    });

    const availableStaff = allStaff.filter(staff => this.isStaffAvailable(staff, bookingDate));
    return new ApiResponseDto({ success: true, message: 'Available staff retrieved.', data: availableStaff });
  }

  // ==================== PRIVATE HELPERS ====================
  private async findAvailableStaff(manager: any, spaId: number, staffId?: number, bookingDate?: Date): Promise<Staff | null> {
    if (staffId) {
      const staff = await manager.findOne(Staff, { 
        where: { id: staffId, spa: { id: spaId }, isActive: true },
        relations: ['spa', 'shifts', 'shifts.shiftDays', 'timeOff']
      });
      if (!staff) throw new NotFoundException('Staff not available.');
      if (bookingDate && !this.isStaffAvailable(staff, bookingDate)) {
        throw new NotFoundException('Staff not available on this date.');
      }
      return staff;
    }

    // Auto-assign available staff
    const allStaff = await manager.find(Staff, { 
      where: { spa: { id: spaId }, isActive: true },
      relations: ['spa', 'shifts', 'shifts.shiftDays', 'timeOff']
    });
    return bookingDate ? allStaff.find(s => this.isStaffAvailable(s, bookingDate)) || null : null;
  }

  private async applyCoupon(manager: any, price: number, couponCode?: string): Promise<{ finalPrice: number; discountPercent: number }> {
    if (!couponCode) return { finalPrice: price, discountPercent: 0 };

    const coupon = await manager.findOne(Coupon, { where: { code: couponCode } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Coupon not available.');
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) throw new BadRequestException('Coupon expired.');
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon limit reached.');
    }

    coupon.currentRedemptions += 1;
    await manager.save(Coupon, coupon);

    const discountPercent = Number(coupon.discountPercent);
    const finalPrice = Number((price * (100 - discountPercent) / 100).toFixed(2));
    return { finalPrice, discountPercent };
  }

  private async createPayment(manager: any, bookingId: number, amount: number, commissionAmount: number, method?: PaymentMethod) {
    let commissionRate = 15;
    try {
      const setting = await this.systemSettings.findOne('commission_rate');
      commissionRate = parseFloat(setting?.data?.value || '15');
    } catch { /* use default */ }

    const paymentMethod = method || PaymentMethod.CASH;

    const payment = manager.create(Payment, {
      bookingId, amount, method: paymentMethod,
      status: PaymentStatus.COMPLETED,
      commissionPercent: commissionRate,
      commissionAmount,
    });
    await manager.save(payment);
  }

  private calculateCommission(amount: number): number {
    return Number((amount * this.DEFAULT_COMMISSION_RATE).toFixed(2));
  }

  private async addLoyaltyPoints(userId: number, points: number, reason: string) {
    try {
      let loyalty = await this.loyaltyRepo.findOne({ where: { userId } });
      if (!loyalty) {
        loyalty = this.loyaltyRepo.create({ userId, points: 0, rank: LoyaltyRank.BRONZE });
      }

      loyalty.points += points;
      loyalty.rank = this.determineRank(loyalty.points);
      await this.loyaltyRepo.save(loyalty);

      const history = this.loyaltyHistoryRepo.create({ userId, points, reason });
      await this.loyaltyHistoryRepo.save(history);
    } catch { /* silent fail - don't break booking flow */ }
  }

  private determineRank(points: number): LoyaltyRank {
    if (points >= 300) return LoyaltyRank.PLATINUM;
    if (points >= 200) return LoyaltyRank.GOLD;
    if (points >= 100) return LoyaltyRank.SILVER;
    return LoyaltyRank.BRONZE;
  }

  private isStaffAvailable(staff: Staff, bookingDate: Date): boolean {
    if (!staff.shifts?.length) return false;

    const dayOfWeek = bookingDate.getDay();
    const bookingTime = `${String(bookingDate.getHours()).padStart(2, '0')}:${String(bookingDate.getMinutes()).padStart(2, '0')}`;

    // Check if staff has shift on this day and time
    const hasShift = staff.shifts.some(shift => {
      if (!shift.shiftDays?.length) return false;
      const isOnDay = shift.shiftDays.some(sd => Number(sd.weekday) === dayOfWeek);
      if (!isOnDay) return false;

      const start = shift.startTime.substring(0, 5);
      const end = shift.endTime.substring(0, 5);
      return bookingTime >= start && bookingTime < end;
    });

    if (!hasShift) return false;

    // Check time off
    if (staff.timeOff?.length) {
      const isOnLeave = staff.timeOff.some(to => 
        bookingDate >= new Date(to.startAt) && bookingDate <= new Date(to.endAt)
      );
      if (isOnLeave) return false;
    }

    return true;
  }

  // ==================== NOTIFICATIONS ====================
  private async sendNotification(userId: number, message: string, meta?: Record<string, any>) {
    try {
      await this.notificationsService.send({
        userId,
        channel: NotificationChannel.PUSH,
        message,
        meta,
      });
    } catch { /* silent fail - don't break main flow */ }
  }
}
