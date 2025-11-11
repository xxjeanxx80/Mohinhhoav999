import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth('Authorization')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Auth(Role.ADMIN)
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  @Get('me')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  findMyNotifications(@Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.notificationsService.findByUser(user.id);
  }

  @Get('bookings')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  findBookingNotifications(@Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.notificationsService.findBookingNotifications(user.id);
  }
}
