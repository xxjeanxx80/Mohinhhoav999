import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Spa } from '../spas/entities/spa.entity';
import { User } from '../users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminLog } from './entities/admin-log.entity';
import { Payout } from '../payouts/entities/payout.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Report } from '../reports/entities/report.entity';
import { SpasModule } from '../spas/spas.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminLog, Booking, Payment, User, Spa, Payout, Campaign, Report]),
    forwardRef(() => SpasModule),
    forwardRef(() => CampaignsModule),
    forwardRef(() => ReportsModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
