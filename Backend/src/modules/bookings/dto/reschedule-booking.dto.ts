import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class RescheduleBookingDto {
  @ApiProperty({ description: 'New scheduled date and time.' })
  @IsDateString()
  scheduledAt: string;
}
