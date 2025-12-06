import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AdminService } from '../admin/admin.service';

@ApiTags('campaigns')
@ApiBearerAuth('Authorization')
@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly adminService: AdminService,
  ) {}

  @Post()
  @Auth(Role.ADMIN)
  async create(@Body() dto: CreateCampaignDto, @Req() req: Request) {
    const admin = req.user as { id: number } | undefined;
    if (admin) {
      await this.adminService.recordAdminAction(admin.id, 'CREATE_CAMPAIGN', {
        name: dto.name,
      });
    }
    return this.campaignsService.create(dto);
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  @Auth(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCampaignDto, @Req() req: Request) {
    const admin = req.user as { id: number } | undefined;
    if (admin) {
      await this.adminService.recordAdminAction(admin.id, 'UPDATE_CAMPAIGN', {
        campaignId: id,
      });
    }
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const admin = req.user as { id: number } | undefined;
    if (admin) {
      await this.adminService.recordAdminAction(admin.id, 'DELETE_CAMPAIGN', {
        campaignId: id,
      });
    }
    return this.campaignsService.remove(id);
  }
}
