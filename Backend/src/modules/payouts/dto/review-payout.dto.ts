import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReviewPayoutDto {
  @ApiProperty()
  @IsNumber()
  payoutId: number;

  @ApiProperty()
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
