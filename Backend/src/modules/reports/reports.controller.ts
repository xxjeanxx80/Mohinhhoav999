import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { ReportsService } from './reports.service';

@ApiBearerAuth('Authorization')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  create(@Req() req: Request, @Body() dto: CreateReportDto) {
    const reporter = req.user as { id: number } | undefined;
    if (!reporter) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.reportsService.create(reporter.id, dto);
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @Auth(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/resolve')
  @Auth(Role.ADMIN)
  resolve(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolveReportDto) {
    return this.reportsService.resolve(id, dto);
  }
}
