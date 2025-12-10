import { BadRequestException, Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { RespondRescheduleDto } from './dto/respond-reschedule.dto';
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

  @Get('available-staff/:spaId')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  getAvailableStaff(
    @Param('spaId', ParseIntPipe) spaId: number,
    @Query('scheduledAt') scheduledAt: string,
  ) {
    return this.bookingsService.getAvailableStaff(spaId, scheduledAt);
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
    this.logger.debug(`Owner bookings request received for user ID: ${ownerId}`);
    return this.bookingsService.findByOwner(ownerId);
  }

  @Get(':id')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/reschedule')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  async reschedule(@Param('id', ParseIntPipe) id: number, @Body() dto: RescheduleBookingDto, @Req() req: Request) {
    try {
      this.logger.debug(`Reschedule request received: id=${id}, dto=${JSON.stringify(dto)}`);
      const user = req.user as { id: number; role: Role } | undefined;
      const result = await this.bookingsService.reschedule(id, dto, user?.id);
      this.logger.debug(`Reschedule successful for booking ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error in reschedule controller for booking ${id}:`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  @Patch(':id/cancel')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
  cancel(@Param('id', ParseIntPipe) id: number, @Body() dto: CancelBookingDto) {
    return this.bookingsService.cancel(id, dto);
  }

  @Patch(':id/reschedule/respond')
  @Auth(Role.OWNER, Role.ADMIN)
  respondToReschedule(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: RespondRescheduleDto,
    @Req() req: Request
  ) {
    const ownerId = (req.user as { id: number }).id;
    return this.bookingsService.respondToReschedule(id, dto.approved, ownerId);
  }

  @Patch(':id/status')
  @Auth(Role.OWNER, Role.ADMIN)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
