import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth('Authorization')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('snapshots/latest')
  @Auth(Role.ADMIN)
  latestSnapshot() {
    return this.dashboardService.latestSnapshot();
  }

  @Get('overview')
  @Auth(Role.ADMIN, Role.OWNER)
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
