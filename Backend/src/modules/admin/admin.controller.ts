import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApproveSpaDto } from '../spas/dto/approve-spa.dto';
import { AdminService } from './admin.service';
import { UpdateCampaignStatusDto } from './dto/update-campaign-status.dto';

@ApiBearerAuth('Authorization')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @Auth(Role.ADMIN)
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Patch('spas/:id/approval')
  @Auth(Role.ADMIN)
  approveSpa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveSpaDto,
    @Req() req: Request,
  ) {
    const admin = req.user as { id: number } | undefined;
    if (!admin) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.adminService.approveSpa(id, dto, admin.id);
  }

  @Patch('campaigns/:id/status')
  @Auth(Role.ADMIN)
  updateCampaignStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignStatusDto,
    @Req() req: Request,
  ) {
    const admin = req.user as { id: number } | undefined;
    if (!admin) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.adminService.updateCampaignStatus(id, dto, admin.id);
  }

  @Get('logs')
  @Auth(Role.ADMIN)
  getLogs() {
    return this.adminService.getLogs();
  }

  @Get('reports')
  @Auth(Role.ADMIN)
  getReports() {
    return this.adminService.getReports();
  }

  @Get('owners')
  @Auth(Role.ADMIN)
  getOwners() {
    return this.adminService.getOwners();
  }

  @Get('payouts')
  @Auth(Role.ADMIN)
  getAllPayouts() {
    return this.adminService.getAllPayouts();
  }
}
