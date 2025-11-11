import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { CompletePayoutDto } from './dto/complete-payout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { ReviewPayoutDto } from './dto/review-payout.dto';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { SystemSettingsService } from '../system-settings/system-settings.service';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout) private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async requestPayout(dto: RequestPayoutDto) {
    // Get user info (can be owner or admin)
    const user = await this.userRepository.findOne({ where: { id: dto.ownerId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Check if bank account is linked
    if (!user.bankName || !user.bankAccountNumber || !user.bankAccountHolder) {
      throw new BadRequestException('Please link your bank account in settings before requesting payout.');
    }

    // Calculate available profit based on role
    let availableProfit: number;
    if (user.role === Role.ADMIN) {
      // For ADMIN: profit = total commission from all bookings
      availableProfit = await this.calculateAdminProfit();
    } else {
      // For OWNER: profit = revenue - commission from their spas
      availableProfit = await this.calculateAvailableProfit(dto.ownerId);
    }
    
    // Check if requested amount exceeds available profit
    if (dto.amount > availableProfit) {
      throw new BadRequestException(`Insufficient profit. Available: ${availableProfit.toFixed(2)} VND`);
    }

    // Create payout and automatically approve & complete (no admin approval needed)
    const payout = this.payoutRepository.create({
      owner: { id: dto.ownerId } as any,
      amount: dto.amount,
      status: PayoutStatus.COMPLETED, // Auto-complete
      requestedAt: new Date(),
      approvedAt: new Date(), // Auto-approve
      completedAt: new Date(), // Auto-complete
      notes: dto.notes ?? `Auto-processed payout to ${user.bankName} - ${user.bankAccountNumber}`,
    });

    const saved = await this.payoutRepository.save(payout);

    return new ApiResponseDto({ 
      success: true, 
      message: 'Payout processed successfully. Funds will be transferred to your bank account.', 
      data: saved 
    });
  }

  /**
   * Calculate available profit for ADMIN
   * Profit = total commission from all completed bookings - already paid out
   * Commission = Revenue × Commission Rate (same logic as dashboard)
   */
  private async calculateAdminProfit(): Promise<number> {
    // Get commission rate
    let commissionRate = 15; // Default 15%
    try {
      const commissionSetting = await this.systemSettingsService.findOne('commission_rate');
      commissionRate = parseFloat(commissionSetting?.data?.value || '15');
    } catch {
      // Use default if setting not found
      commissionRate = 15;
    }

    // Get all completed bookings from all spas (no time limit)
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getMany();

    // Calculate total revenue from all completed bookings
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + Number(booking.finalPrice || booking.totalPrice || 0);
    }, 0);

    // Calculate total commission = Revenue × Commission Rate (same as dashboard)
    const totalCommission = totalRevenue * (commissionRate / 100);

    // Get all admin users
    const adminUsers = await this.userRepository.find({
      where: { role: Role.ADMIN },
      select: ['id'],
    });

    // Get total amount already paid out by all admins
    const adminIds = adminUsers.map(u => u.id);
    let totalPaidOut = 0;
    
    if (adminIds.length > 0) {
      const completedPayouts = await this.payoutRepository
        .createQueryBuilder('payout')
        .leftJoinAndSelect('payout.owner', 'owner')
        .where('owner.id IN (:...adminIds)', { adminIds })
        .andWhere('payout.status = :status', { status: PayoutStatus.COMPLETED })
        .getMany();
      
      totalPaidOut = completedPayouts.reduce((sum, payout) => {
        return sum + Number(payout.amount || 0);
      }, 0);
    }

    // Available profit = total commission - already paid out
    const available = totalCommission - totalPaidOut;
    return Math.max(0, available); // Cannot be negative
  }

  /**
   * Calculate available profit for OWNER
   * Profit = (revenue - commission) from owner's spas - already paid out
   */
  private async calculateAvailableProfit(ownerId: number): Promise<number> {
    // Get commission rate
    let commissionRate = 10; // Default 10%
    try {
      const commissionSetting = await this.systemSettingsService.findOne('commission_rate');
      commissionRate = parseFloat(commissionSetting?.data?.value || '10');
    } catch {
      // Use default if setting not found
      commissionRate = 10;
    }

    // Get all completed bookings for this owner's spas (no time limit)
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .andWhere('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getMany();

    // Calculate total revenue from completed bookings
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + Number(booking.finalPrice || booking.totalPrice || 0);
    }, 0);

    // Calculate profit (revenue - commission)
    const totalProfit = totalRevenue * (1 - commissionRate / 100);

    // Get total amount already paid out
    const completedPayouts = await this.payoutRepository.find({
      where: { 
        owner: { id: ownerId },
        status: PayoutStatus.COMPLETED,
      },
    });

    const totalPaidOut = completedPayouts.reduce((sum, payout) => {
      return sum + Number(payout.amount || 0);
    }, 0);

    // Available profit = total profit - already paid out
    const available = totalProfit - totalPaidOut;
    return Math.max(0, available); // Cannot be negative
  }

  async reviewPayout(dto: ReviewPayoutDto) {
    const payout = await this.payoutRepository.findOne({ where: { id: dto.payoutId } });
    if (!payout) {
      throw new NotFoundException('Payout not found.');
    }

    if (payout.status !== PayoutStatus.REQUESTED) {
      throw new BadRequestException('Only requested payouts can be reviewed.');
    }

    if (dto.approved) {
      payout.status = PayoutStatus.APPROVED;
      payout.approvedAt = new Date();
    } else {
      payout.status = PayoutStatus.REJECTED;
      payout.notes = dto.notes ?? null;
    }

    const saved = await this.payoutRepository.save(payout);
    return new ApiResponseDto({ success: true, message: 'Payout review updated.', data: saved });
  }

  async completePayout(dto: CompletePayoutDto) {
    const payout = await this.payoutRepository.findOne({ where: { id: dto.payoutId } });
    if (!payout) {
      throw new NotFoundException('Payout not found.');
    }

    if (payout.status !== PayoutStatus.APPROVED) {
      throw new BadRequestException('Only approved payouts can be completed.');
    }

    payout.status = PayoutStatus.COMPLETED;
    payout.completedAt = new Date();
    payout.notes = dto.notes ?? payout.notes ?? null;

    const saved = await this.payoutRepository.save(payout);
    return new ApiResponseDto({ success: true, message: 'Payout completed.', data: saved });
  }

  async findByOwner(ownerId: number) {
    const payouts = await this.payoutRepository.find({
      where: { owner: { id: ownerId } },
      order: { requestedAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Payouts by owner retrieved.',
      data: { payouts },
    });
  }

  async getAvailableProfit(userId: number, userRole: Role) {
    let availableProfit: number;
    
    if (userRole === Role.ADMIN) {
      // Get detailed info for debugging
      const commissionRate = await this.getCommissionRate();
      
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.status = :status', { status: BookingStatus.COMPLETED })
        .getMany();
      
      // Calculate total revenue from all completed bookings
      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + Number(booking.finalPrice || booking.totalPrice || 0);
      }, 0);

      // Calculate total commission = Revenue × Commission Rate (same as dashboard)
      const totalCommission = totalRevenue * (commissionRate / 100);

      const adminUsers = await this.userRepository.find({
        where: { role: Role.ADMIN },
        select: ['id'],
      });
      const adminIds = adminUsers.map(u => u.id);
      
      let totalPaidOut = 0;
      if (adminIds.length > 0) {
        const completedPayouts = await this.payoutRepository
          .createQueryBuilder('payout')
          .leftJoinAndSelect('payout.owner', 'owner')
          .where('owner.id IN (:...adminIds)', { adminIds })
          .andWhere('payout.status = :status', { status: PayoutStatus.COMPLETED })
          .getMany();
        
        totalPaidOut = completedPayouts.reduce((sum, payout) => {
          return sum + Number(payout.amount || 0);
        }, 0);
      }

      availableProfit = totalCommission - totalPaidOut;
    } else {
      availableProfit = await this.calculateAvailableProfit(userId);
    }

    return new ApiResponseDto({
      success: true,
      message: 'Available profit retrieved.',
      data: { 
        availableProfit,
      },
    });
  }

  private async getCommissionRate(): Promise<number> {
    try {
      const commissionSetting = await this.systemSettingsService.findOne('commission_rate');
      return parseFloat(commissionSetting?.data?.value || '15');
    } catch {
      return 15;
    }
  }
}
