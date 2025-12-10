import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Spa } from '../spas/entities/spa.entity';
import { User } from '../users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Payout } from '../payouts/entities/payout.entity';
import { Report } from '../reports/entities/report.entity';
import { SpasModule } from '../spas/spas.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Payment, User, Spa, Payout, Report]),
    forwardRef(() => SpasModule),
    forwardRef(() => ReportsModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
