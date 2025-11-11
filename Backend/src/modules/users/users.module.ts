import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoyaltyHistory } from './entities/loyalty-history.entity';
import { Loyalty } from './entities/loyalty.entity';
import { User } from './entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Loyalty, LoyaltyHistory, Booking, Feedback]),
    MediaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
