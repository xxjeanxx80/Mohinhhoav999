import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, description: 'New booking status' })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

