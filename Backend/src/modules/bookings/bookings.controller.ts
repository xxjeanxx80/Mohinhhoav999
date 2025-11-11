import { BadRequestException, Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiBearerAuth('Authorization')
@Controller('bookings')
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      this.logger.warn('User not authenticated');
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Creating booking for user ${user.id}`);
    
    try {
      return await this.bookingsService.create({ ...dto, customerId: user.id });
    } catch (error) {
      this.logger.error('Booking creation error', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('me')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  findMyBookings(@Req() req: Request) {
    const user = req.user as { id: number; role: Role } | undefined;
    return this.bookingsService.findByUser(user?.id);
  }

  @Get('owner')
  @Auth(Role.OWNER)
  findOwnerBookings(@Req() req: Request) {
    const ownerId = (req.user as { id: number }).id;
    return this.bookingsService.findByOwner(ownerId);
  }

  @Get(':id')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/reschedule')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  reschedule(@Param('id', ParseIntPipe) id: number, @Body() dto: RescheduleBookingDto) {
    return this.bookingsService.reschedule(id, dto);
  }

  @Patch(':id/cancel')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  cancel(@Param('id', ParseIntPipe) id: number, @Body() dto: CancelBookingDto) {
    return this.bookingsService.cancel(id, dto);
  }

  @Patch(':id/status')
  @Auth(Role.OWNER, Role.ADMIN)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
