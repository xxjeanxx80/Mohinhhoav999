import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardSnapshot } from './entities/dashboard-snapshot.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardSnapshot, Booking, Payment, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
