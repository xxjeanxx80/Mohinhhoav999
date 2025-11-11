import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ description: 'Staff ID' })
  @IsInt()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({ description: 'Day of week (1=Monday, 2=Tuesday, ..., 6=Saturday, 0=Sunday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:MM format', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM format' })
  endTime: string;
}

