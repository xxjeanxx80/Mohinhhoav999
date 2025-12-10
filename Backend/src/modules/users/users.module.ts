import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoyaltyHistory } from './entities/loyalty-history.entity';
import { Loyalty } from './entities/loyalty.entity';
import { User } from './entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { Spa } from '../spas/entities/spa.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../payouts/entities/payout.entity';
import { Report } from '../reports/entities/report.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Post } from '../posts/entities/post.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Loyalty,
      LoyaltyHistory,
      Booking,
      Feedback,
      Spa,
      Payment,
      Payout,
      Report,
      Notification,
      Post,
      SpaService,
      Staff,
    ]),
    MediaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
