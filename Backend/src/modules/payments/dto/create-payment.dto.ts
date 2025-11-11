import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  bookingId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ minimum: 0, maximum: 100, default: 15 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transactionReference?: string;
}
