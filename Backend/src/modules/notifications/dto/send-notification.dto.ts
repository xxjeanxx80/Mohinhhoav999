import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '../entities/notification.entity';

export class SendNotificationDto {
  @ApiProperty({ enum: [NotificationChannel.PUSH], description: 'Only PUSH channel is supported for admin notifications.' })
  @IsEnum([NotificationChannel.PUSH], { message: 'Only PUSH channel is allowed for notifications.' })
  channel: NotificationChannel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false, description: 'Additional context to send with the notification.' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}
