import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpasModule } from '../spas/spas.module';
import { Spa } from '../spas/entities/spa.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffShift } from './entities/staff-shift.entity';
import { StaffShiftDay } from './entities/staff-shift-day.entity';
import { StaffSkill } from './entities/staff-skill.entity';
import { StaffTimeOff } from './entities/staff-time-off.entity';
import { Staff } from './entities/staff.entity';

@Module({
  imports: [SpasModule, TypeOrmModule.forFeature([Staff, StaffSkill, StaffShift, StaffShiftDay, StaffTimeOff, Spa])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
