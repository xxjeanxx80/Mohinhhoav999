import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Spa } from '../spas/entities/spa.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../users/entities/user.entity';
import { Loyalty } from '../users/entities/loyalty.entity';
import { LoyaltyHistory } from '../users/entities/loyalty-history.entity';
import { Payment } from '../payments/entities/payment.entity';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Spa, SpaService, User, Staff, Coupon, Loyalty, LoyaltyHistory, Payment]),
    SystemSettingsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
