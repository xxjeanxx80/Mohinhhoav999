import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class RequestPayoutDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  ownerId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
