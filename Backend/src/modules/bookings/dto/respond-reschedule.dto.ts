import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RespondRescheduleDto {
  @ApiProperty({ description: 'Whether to approve (true) or reject (false) the reschedule request' })
  @IsBoolean()
  approved: boolean;
}

