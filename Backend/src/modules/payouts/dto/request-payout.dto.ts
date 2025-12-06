import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class RequestPayoutDto {
  @ApiProperty()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  @IsNumber()
  @IsPositive()
  ownerId: number;

  @ApiProperty()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
