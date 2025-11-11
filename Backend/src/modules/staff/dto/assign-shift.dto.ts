import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({ description: 'Start time of the shift in ISO format.' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time of the shift in ISO format.' })
  @IsDateString()
  endTime: string;
}
