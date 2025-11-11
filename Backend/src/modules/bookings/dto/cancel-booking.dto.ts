import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ required: false, description: 'Optional reason for cancelling the booking.' })
  @IsString()
  @IsOptional()
  reason?: string;
}
