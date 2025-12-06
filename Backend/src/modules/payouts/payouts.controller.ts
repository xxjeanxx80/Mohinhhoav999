import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CompletePayoutDto } from './dto/complete-payout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { ReviewPayoutDto } from './dto/review-payout.dto';
import { PayoutsService } from './payouts.service';
import { AdminService } from '../admin/admin.service';

@ApiTags('payouts')
@ApiBearerAuth('Authorization')
@Controller('payouts')
export class PayoutsController {
  private readonly logger = new Logger(PayoutsController.name);

  constructor(
    private readonly payoutsService: PayoutsService,
    private readonly adminService: AdminService,
  ) {}

  @Post()
  @Auth(Role.OWNER, Role.ADMIN) // Allow ADMIN to request payout too
  async request(@Body() dto: RequestPayoutDto, @Req() req: Request) {
    try {
      const admin = req.user as { id: number; role: Role } | undefined;
      if (admin && admin.role === Role.ADMIN) {
        await this.adminService.recordAdminAction(admin.id, 'REQUEST_PAYOUT', {
          amount: dto.amount,
        });
      }
      return await this.payoutsService.requestPayout(dto);
    } catch (error) {
      this.logger.error(`Request payout error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  @Patch('review')
  @Auth(Role.ADMIN)
  async review(@Body() dto: ReviewPayoutDto, @Req() req: Request) {
    const admin = req.user as { id: number } | undefined;
    if (admin) {
      await this.adminService.recordAdminAction(admin.id, 'REVIEW_PAYOUT', {
        payoutId: dto.payoutId,
        approved: dto.approved,
      });
    }
    return this.payoutsService.reviewPayout(dto);
  }

  @Patch('complete')
  @Auth(Role.ADMIN)
  async complete(@Body() dto: CompletePayoutDto, @Req() req: Request) {
    const admin = req.user as { id: number } | undefined;
    if (admin) {
      await this.adminService.recordAdminAction(admin.id, 'COMPLETE_PAYOUT', {
        payoutId: dto.payoutId,
      });
    }
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
