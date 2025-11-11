import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { CampaignsService } from '../campaigns/campaigns.service';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { ApproveSpaDto } from '../spas/dto/approve-spa.dto';
import { SpasService } from '../spas/spas.service';
import { User } from '../users/entities/user.entity';
import { Spa } from '../spas/entities/spa.entity';
import { UpdateCampaignStatusDto } from './dto/update-campaign-status.dto';
import { AdminLog } from './entities/admin-log.entity';
import { ReportsService } from '../reports/reports.service';
import { Payout } from '../payouts/entities/payout.entity';

export interface MetricsPayload {
  totalUsers: number;
  totalBookings: number;
  totalSpas: number;
  totalRevenue: number;
  newCustomers: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminLog) private readonly adminLogRepository: Repository<AdminLog>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
    @InjectRepository(Payout) private readonly payoutRepository: Repository<Payout>,
    private readonly spasService: SpasService,
    private readonly campaignsService: CampaignsService,
    private readonly reportsService: ReportsService,
  ) {}

  async getMetrics() {
    const metrics = await this.calculateMetrics();
    return new ApiResponseDto({
      success: true,
      message: 'Administrative metrics generated.',
      data: metrics,
    });
  }

  async approveSpa(spaId: number, dto: ApproveSpaDto, adminId: number) {
    const response = await this.spasService.approve(spaId, dto);
    await this.recordLog(adminId, 'SPA_APPROVAL', {
      spaId,
      approved: dto.isApproved,
    });
    return response;
  }

  async updateCampaignStatus(campaignId: number, dto: UpdateCampaignStatusDto, adminId: number) {
    const response = await this.campaignsService.update(campaignId, { isActive: dto.isActive });
    await this.recordLog(adminId, 'CAMPAIGN_STATUS_UPDATE', {
      campaignId,
      isActive: dto.isActive,
    });
    return response;
  }

  async getLogs() {
    const logs = await this.adminLogRepository.find({ order: { createdAt: 'DESC' } });
    return new ApiResponseDto({ success: true, message: 'Admin logs retrieved.', data: logs });
  }

  async getReports() {
    return this.reportsService.findAll();
  }

  async getOwners() {
    const owners = await this.userRepository.find({
      where: { role: Role.OWNER },
      select: ['id', 'name', 'email', 'phone', 'address', 'bankName', 'bankAccountNumber', 'bankAccountHolder', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'Owners retrieved.', data: owners });
  }

  async getAllPayouts() {
    const payouts = await this.payoutRepository.find({
      relations: ['owner'],
      order: { requestedAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'All payouts retrieved.', data: { payouts } });
  }

  private async calculateMetrics(): Promise<MetricsPayload> {
    // Get all data (without deep relations to avoid circular issues)
    const allUsers = await this.userRepository.find();
    const allBookings = await this.bookingRepository.find({ 
      order: { createdAt: 'DESC' }
    });
    // Get completed bookings (same logic as owner dashboard)
    const completedBookings = allBookings.filter(b => b.status === BookingStatus.COMPLETED);
    const completedPayments = await this.paymentRepository.find({ 
      where: { status: PaymentStatus.COMPLETED }
    });
    const approvedSpas = await this.spaRepository.find({ where: { isApproved: true } });
    const customerAccounts = allUsers.filter(u => u.role === Role.CUSTOMER);

    // Calculate total revenue from completed payments
    const totalRevenue = completedPayments.reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0);
    
    // Calculate new customers (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const newCustomers = customerAccounts.filter((user) => user.createdAt && user.createdAt >= since).length;

    // Calculate monthly revenue for last 6 months based on booking.scheduledAt (same as owner dashboard)
    const monthlyRevenue = this.calculateMonthlyRevenue(completedBookings);

    return {
      totalUsers: allUsers.length,
      totalBookings: allBookings.length,
      totalSpas: approvedSpas.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      newCustomers,
      monthlyRevenue,
    };
  }

  private calculateMonthlyRevenue(bookings: Booking[]): Array<{ month: string; revenue: number; bookings: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyData: { [key: string]: { revenue: number; bookings: number } } = {};

    // Initialize last 6 months with year (e.g., "Oct 2025", "Nov 2025")
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = { revenue: 0, bookings: 0 };
    }

    // Aggregate bookings by scheduledAt month (same logic as owner dashboard)
    bookings.forEach((booking) => {
      if (booking.scheduledAt) {
        const scheduledDate = new Date(booking.scheduledAt);
        const monthKey = `${monthNames[scheduledDate.getMonth()]} ${scheduledDate.getFullYear()}`;
        
        if (monthlyData[monthKey]) {
          // Use finalPrice (same as owner dashboard)
          monthlyData[monthKey].revenue += Number(booking.finalPrice ?? booking.totalPrice ?? 0);
          monthlyData[monthKey].bookings += 1;
        }
      }
    });

    // Convert to array and sort by month (most recent first)
    return Object.entries(monthlyData)
      .sort((a, b) => {
        // Sort by year and month
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB.getTime() - dateA.getTime();
      })
      .map(([month, data]) => ({
        month,
        revenue: Number(data.revenue.toFixed(2)),
        bookings: data.bookings,
      }));
  }

  private async recordLog(adminId: number, action: string, details?: Record<string, unknown>) {
    const entry = this.adminLogRepository.create({
      admin: { id: adminId } as any,
      action,
      details: details ?? null,
    });
    await this.adminLogRepository.save(entry);
  }
}
