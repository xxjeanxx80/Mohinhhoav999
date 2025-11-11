import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@ApiBearerAuth('Authorization')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Auth(Role.ADMIN, Role.OWNER)
  create(@Body() dto: CreateServiceDto, @Req() req: Request) {
    const user = req.user as { id: number; role: string };
    return this.servicesService.create(dto, user.id, user.role as Role);
  }

  @Get()
  @Auth(Role.ADMIN, Role.OWNER)
  findAll(@Req() req: Request) {
    const user = req.user as { id: number; role: string };
    // If OWNER, filter by their spas only
    if (user.role === Role.OWNER) {
      return this.servicesService.findByOwner(user.id);
    }
    // ADMIN sees all
    return this.servicesService.findAll();
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }

  @Get('spa/:spaId')
  findBySpa(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.servicesService.findBySpa(spaId);
  }
}
