import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ApproveSpaDto {
  @ApiProperty({ description: 'Whether the spa is approved by an administrator.' })
  @IsBoolean()
  isApproved: boolean;
}
