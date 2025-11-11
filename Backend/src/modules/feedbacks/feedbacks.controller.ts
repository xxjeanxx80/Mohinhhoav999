import { Body, Controller, ForbiddenException, Get, Logger, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbacksService } from './feedbacks.service';

@ApiTags('feedbacks')
@Controller('feedbacks')
export class FeedbacksController {
  private readonly logger = new Logger(FeedbacksController.name);

  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @Auth(Role.CUSTOMER, Role.ADMIN)
  create(@Req() req: Request, @Body() dto: CreateFeedbackDto) {
    const user = req.user as { id: number; role: Role } | undefined;
    this.logger.debug(`Creating feedback request from user ${user?.id} (${user?.role})`);
    
    if (!user) {
      this.logger.warn('No user in request');
      throw new ForbiddenException('Authentication context is missing.');
    }
    
    // Validate DTO
    if (!dto.bookingId || !dto.rating) {
      this.logger.warn(`Invalid DTO from user ${user.id}: missing bookingId or rating`);
      throw new ForbiddenException('Invalid feedback data.');
    }
    
    return this.feedbacksService.create(user.id, dto);
  }

  @Get()
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN)
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get('public/recent')
  @ApiExcludeEndpoint()
  findRecent() {
    return this.feedbacksService.findRecent();
  }

  @Get('booking/:bookingId')
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN, Role.OWNER)
  findForBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.feedbacksService.findForBooking(bookingId);
  }

  @Get('spa/:spaId')
  @ApiExcludeEndpoint()
  findBySpa(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.feedbacksService.findBySpa(spaId);
  }

  @Get('owner/mine')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER)
  findByOwner(@Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.feedbacksService.findByOwner(user.id);
  }
}
