import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCampaignStatusDto {
  @ApiProperty({ description: 'Whether the campaign is active.' })
  @IsBoolean()
  isActive: boolean;
}
