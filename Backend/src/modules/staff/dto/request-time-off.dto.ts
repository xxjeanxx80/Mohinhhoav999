import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestTimeOffDto {
  @ApiProperty({ description: 'Start time of the time off request.' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: 'End time of the time off request.' })
  @IsDateString()
  endAt: string;

  @ApiProperty({ required: false, description: 'Reason for the time off request.' })
  @IsString()
  @IsOptional()
  reason?: string;
}
