import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../payments/entities/payment.entity';

export class CreateBookingDto {
  @ApiProperty({ description: 'Spa identifier for the booking.' })
  @Type(() => Number)
  @IsInt()
  spaId: number;

  @ApiProperty({ description: 'Service identifier for the booking.' })
  @Type(() => Number)
  @IsInt()
  serviceId: number;

  @ApiProperty({ required: false, description: 'Customer identifier (auto-injected from JWT)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ required: false, description: 'Staff member assigned to the booking.' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  staffId?: number;

  @ApiProperty({ description: 'Scheduled date and time for the booking.' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ required: false, description: 'Optional coupon code applied to the booking.' })
  @IsString()
  @IsOptional()
  couponCode?: string | null;

  @ApiProperty({ required: false, description: 'Payment method for the booking.', enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
