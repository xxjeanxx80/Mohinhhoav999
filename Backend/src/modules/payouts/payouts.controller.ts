import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CompletePayoutDto } from './dto/complete-payout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { ReviewPayoutDto } from './dto/review-payout.dto';
import { PayoutsService } from './payouts.service';

@ApiTags('payouts')
@ApiBearerAuth('Authorization')
@Controller('payouts')
export class PayoutsController {
  private readonly logger = new Logger(PayoutsController.name);

  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @Auth(Role.OWNER, Role.ADMIN) // Allow ADMIN to request payout too
  async request(@Body() dto: RequestPayoutDto, @Req() req: Request) {
    try {
      return await this.payoutsService.requestPayout(dto);
    } catch (error) {
      this.logger.error(`Request payout error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  @Patch('review')
  @Auth(Role.ADMIN)
  review(@Body() dto: ReviewPayoutDto) {
    return this.payoutsService.reviewPayout(dto);
  }

  @Patch('complete')
  @Auth(Role.ADMIN)
  complete(@Body() dto: CompletePayoutDto) {
    return this.payoutsService.completePayout(dto);
  }

  @Get('available-profit')
  @Auth(Role.ADMIN, Role.OWNER)
  getAvailableProfit(@Req() req: Request) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.payoutsService.getAvailableProfit(user.id, user.role);
  }

  @Get('owner/:ownerId')
  @Auth(Role.ADMIN, Role.OWNER)
  findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return this.payoutsService.findByOwner(ownerId);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payoutsService.findOne(id);
  }
}
