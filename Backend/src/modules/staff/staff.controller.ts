import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RequestTimeOffDto } from './dto/request-time-off.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@ApiTags('staff')
@ApiBearerAuth('Authorization')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Auth(Role.ADMIN, Role.OWNER)
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Get()
  @Auth(Role.ADMIN, Role.OWNER)
  findAll(@Req() req: Request) {
    const user = req.user as { id: number; role: string };
    // If OWNER, filter by their spas only
    if (user.role === Role.OWNER) {
      return this.staffService.findByOwner(user.id);
    }
    // ADMIN sees all
    return this.staffService.findAll();
  }

  @Get('shifts')
  @Auth(Role.ADMIN, Role.OWNER)
  findAllShifts(@Req() req: Request) {
    const user = req.user as { id: number; role: string };
    // If OWNER, filter by their spas only
    const ownerId = user.role === Role.OWNER ? user.id : undefined;
    return this.staffService.findAllShifts(ownerId);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }

  @Post('shifts')
  @Auth(Role.ADMIN, Role.OWNER)
  createShift(@Body() dto: CreateShiftDto) {
    return this.staffService.createShift(dto);
  }

  @Patch('shifts/:shiftId')
  @Auth(Role.ADMIN, Role.OWNER)
  updateShift(@Param('shiftId', ParseIntPipe) shiftId: number, @Body() dto: UpdateShiftDto) {
    return this.staffService.updateShift(shiftId, dto);
  }

  @Delete('shifts/:shiftId')
  @Auth(Role.ADMIN, Role.OWNER)
  deleteShift(@Param('shiftId', ParseIntPipe) shiftId: number) {
    return this.staffService.deleteShift(shiftId);
  }

  @Post(':id/time-off')
  @Auth(Role.ADMIN, Role.OWNER)
  requestTimeOff(@Param('id', ParseIntPipe) id: number, @Body() dto: RequestTimeOffDto) {
    return this.staffService.requestTimeOff(id, dto);
  }

  @Get(':id/skills')
  @Auth(Role.OWNER, Role.ADMIN)
  getSkills(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.getSkills(id);
  }

  @Post(':id/skills')
  @Auth(Role.OWNER, Role.ADMIN)
  addSkill(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSkillDto) {
    return this.staffService.addSkill(id, dto);
  }

  @Delete(':id/skills/:skillId')
  @Auth(Role.OWNER, Role.ADMIN)
  removeSkill(@Param('id', ParseIntPipe) id: number, @Param('skillId', ParseIntPipe) skillId: number) {
    return this.staffService.removeSkill(id, skillId);
  }

  @Get('spa/:spaId')
  findBySpa(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.staffService.findBySpa(spaId);
  }

  @Get(':id/availability')
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.checkAvailability(id);
  }
}
