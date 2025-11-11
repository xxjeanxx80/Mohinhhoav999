import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { SystemSettingsModule } from '../system-settings/system-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payout, Booking, User]),
    SystemSettingsModule,
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService],
})
export class PayoutsModule {}
