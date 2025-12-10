import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { ApproveSpaDto } from '../spas/dto/approve-spa.dto';
import { SpasService } from '../spas/spas.service';
import { User } from '../users/entities/user.entity';
import { Spa } from '../spas/entities/spa.entity';
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
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
    @InjectRepository(Payout) private readonly payoutRepository: Repository<Payout>,
    private readonly spasService: SpasService,
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

  async approveSpa(spaId: number, dto: ApproveSpaDto) {
    return this.spasService.approve(spaId, dto);
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
    const allUsers = await this.userRepository.find();
    const allBookings = await this.bookingRepository.find({ order: { createdAt: 'DESC' } });
    const completedBookings = allBookings.filter(b => b.status === BookingStatus.COMPLETED);
    const completedPayments = await this.paymentRepository.find({ where: { status: PaymentStatus.COMPLETED } });
    const approvedSpas = await this.spaRepository.find({ where: { isApproved: true } });
    const customerAccounts = allUsers.filter(u => u.role === Role.CUSTOMER);
    const totalRevenue = completedPayments.reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const newCustomers = customerAccounts.filter((user) => user.createdAt && user.createdAt >= since).length;
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
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()] + ' ' + date.getFullYear();
      monthlyData[monthKey] = { revenue: 0, bookings: 0 };
    }
    bookings.forEach((booking) => {
      if (booking.scheduledAt) {
        const scheduledDate = new Date(booking.scheduledAt);
        const monthKey = monthNames[scheduledDate.getMonth()] + ' ' + scheduledDate.getFullYear();
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += Number(booking.finalPrice ?? booking.totalPrice ?? 0);
          monthlyData[monthKey].bookings += 1;
        }
      }
    });
    return Object.entries(monthlyData)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([month, data]) => ({ month, revenue: Number(data.revenue.toFixed(2)), bookings: data.bookings }));
  }
}
