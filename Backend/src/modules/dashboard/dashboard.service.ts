import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { DashboardSnapshot } from './entities/dashboard-snapshot.entity';

@Injectable()
export class DashboardService implements OnModuleInit, OnModuleDestroy {
  private readonly dailyInterval = 24 * 60 * 60 * 1000;
  private intervalRef?: NodeJS.Timeout;
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(DashboardSnapshot)
    private readonly dashboardRepository: Repository<DashboardSnapshot>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      await this.generateDailySnapshot(new Date());
      this.intervalRef = setInterval(() => {
        void this.generateDailySnapshot(new Date());
      }, this.dailyInterval);
    } catch (error) {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to initialize dashboard snapshots', trace);
    }
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  async generateDailySnapshot(reference: Date) {
    const snapshotDate = new Date(reference);
    const metrics = await this.calculateMetrics();

    const snapshot = this.dashboardRepository.create({
      snapshotDate,
      bookingsCount: metrics.totalBookings,
      totalRevenue: metrics.totalRevenue,
      newCustomers: metrics.newCustomers,
    });

    return this.dashboardRepository.save(snapshot);
  }

  async latestSnapshot() {
    const snapshot = await this.dashboardRepository.findOne({
      order: { snapshotDate: 'DESC' },
    });

    return new ApiResponseDto({ success: true, message: 'Latest dashboard snapshot.', data: snapshot });
  }

  async getOverview() {
    const metrics = await this.calculateMetrics();
    return new ApiResponseDto({
      success: true,
      message: 'Dashboard overview retrieved.',
      data: metrics,
    });
  }

  private async calculateMetrics() {
    const bookings = await this.bookingRepository.find({ where: { status: BookingStatus.CONFIRMED } });
    const payments = await this.paymentRepository.find({ where: { status: PaymentStatus.COMPLETED } });
    const customers = await this.userRepository.find({ where: { role: Role.CUSTOMER } });

    const totalRevenue = payments.reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const newCustomers = customers.filter((user) => user.createdAt && user.createdAt >= since).length;

    return {
      totalBookings: bookings.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      newCustomers,
    };
  }
}
