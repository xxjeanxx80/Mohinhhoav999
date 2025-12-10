import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateTimeOffDto {
  @ApiProperty({ required: false, description: 'Start time of the time off request.' })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiProperty({ required: false, description: 'End time of the time off request.' })
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiProperty({ required: false, description: 'Reason for the time off request.' })
  @IsString()
  @IsOptional()
  reason?: string;
}
