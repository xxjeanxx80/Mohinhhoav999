import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Spa } from '../spas/entities/spa.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RequestTimeOffDto } from './dto/request-time-off.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffShift } from './entities/staff-shift.entity';
import { StaffShiftDay } from './entities/staff-shift-day.entity';
import { StaffSkill } from './entities/staff-skill.entity';
import { StaffTimeOff } from './entities/staff-time-off.entity';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffSkill) private readonly skillRepository: Repository<StaffSkill>,
    @InjectRepository(StaffShift) private readonly shiftRepository: Repository<StaffShift>,
    @InjectRepository(StaffShiftDay) private readonly shiftDayRepository: Repository<StaffShiftDay>,
    @InjectRepository(StaffTimeOff) private readonly timeOffRepository: Repository<StaffTimeOff>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
  ) {}

  async create(dto: CreateStaffDto) {
    const spa = await this.spaRepository.findOne({ where: { id: dto.spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const staff = this.staffRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      spa,
      skills: dto.skills?.map((name) => this.skillRepository.create({ name })),
    });

    await this.staffRepository.save(staff);

    return new ApiResponseDto({ success: true, message: 'Staff member created.', data: staff });
  }

  async findAll() {
    const staff = await this.staffRepository.find({ relations: ['skills', 'shifts', 'timeOff'] });
    return new ApiResponseDto({ success: true, message: 'Staff members retrieved.', data: staff });
  }

  async findOne(id: number) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['skills', 'shifts', 'timeOff'] });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Staff member retrieved.', data: staff });
  }

  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['skills'] });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    Object.assign(staff, dto);

    if (dto.skills) {
      await this.skillRepository.delete({ staff: { id: staff.id } });
      staff.skills = dto.skills.map((name) => this.skillRepository.create({ name, staff }));
    }

    await this.staffRepository.save(staff);

    return new ApiResponseDto({ success: true, message: 'Staff member updated.', data: staff });
  }

  async remove(id: number) {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    await this.staffRepository.delete(id);

    return new ApiResponseDto({ success: true, message: 'Staff member removed.' });
  }

  async createShift(dto: CreateShiftDto) {
    const staff = await this.staffRepository.findOne({ where: { id: dto.staffId } });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    // Create shift
    const shift = this.shiftRepository.create({
      staff,
      startTime: dto.startTime + ':00', // Add seconds
      endTime: dto.endTime + ':00',
    });

    const savedShift = await this.shiftRepository.save(shift);

    // Create shift day
    const shiftDay = this.shiftDayRepository.create({
      shift: savedShift,
      weekday: dto.dayOfWeek,
    });

    await this.shiftDayRepository.save(shiftDay);

    // Reload with relations
    const result = await this.shiftRepository.findOne({
      where: { id: savedShift.id },
      relations: ['staff', 'shiftDays'],
    });

    return new ApiResponseDto({ success: true, message: 'Shift created.', data: result });
  }

  async requestTimeOff(id: number, dto: RequestTimeOffDto) {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    const timeOff = this.timeOffRepository.create({
      staff,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      reason: dto.reason ?? null,
    });

    await this.timeOffRepository.save(timeOff);

    return new ApiResponseDto({ success: true, message: 'Time off recorded.', data: timeOff });
  }

  async getSkills(staffId: number) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId }, relations: ['skills'] });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Skills retrieved.', data: staff.skills || [] });
  }

  async addSkill(staffId: number, dto: CreateSkillDto) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    const skill = this.skillRepository.create({
      staff,
      name: dto.name,
    });

    await this.skillRepository.save(skill);

    return new ApiResponseDto({ success: true, message: 'Skill added.', data: skill });
  }

  async removeSkill(staffId: number, skillId: number) {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId, staff: { id: staffId } },
      relations: ['staff'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found for this staff member.');
    }

    await this.skillRepository.delete(skillId);

    return new ApiResponseDto({ success: true, message: 'Skill removed.' });
  }

  async findBySpa(spaId: number) {
    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const staff = await this.staffRepository.find({
      where: { spa: { id: spaId }, isActive: true },
      relations: ['spa', 'skills'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Staff by spa retrieved.',
      data: { staff },
    });
  }

  async checkAvailability(id: number) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['shifts', 'timeOff'],
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found.');
    }

    const now = new Date();
    const upcomingShifts = staff.shifts?.filter((shift) => new Date(shift.startTime) > now) || [];
    const upcomingTimeOff = staff.timeOff?.filter((timeOff) => new Date(timeOff.endAt) >= now) || [];

    return new ApiResponseDto({
      success: true,
      message: 'Staff availability retrieved.',
      data: {
        staff: {
          id: staff.id,
          name: staff.name,
          isActive: staff.isActive,
        },
        upcomingShifts: upcomingShifts.slice(0, 10), // Next 10 shifts
        upcomingTimeOff,
      },
    });
  }

  async findByOwner(ownerId: number) {
    const staff = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .leftJoinAndSelect('staff.skills', 'skills')
      .leftJoinAndSelect('staff.shifts', 'shifts')
      .leftJoinAndSelect('staff.timeOff', 'timeOff')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('staff.createdAt', 'DESC')
      .getMany();

    return new ApiResponseDto({
      success: true,
      message: 'Owner staff members retrieved.',
      data: staff,
    });
  }

  async findAllShifts(ownerId?: number) {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.staff', 'staff')
      .leftJoinAndSelect('shift.shiftDays', 'shiftDays')
      .leftJoinAndSelect('staff.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .orderBy('shift.createdAt', 'DESC');

    // If owner, filter by their spas only
    if (ownerId) {
      queryBuilder.where('owner.id = :ownerId', { ownerId });
    }

    const shifts = await queryBuilder.getMany();

    // Transform to match frontend expectations
    const transformedShifts = shifts.map(shift => ({
      id: shift.id,
      staff: shift.staff,
      dayOfWeek: shift.shiftDays && shift.shiftDays.length > 0 ? Number(shift.shiftDays[0].weekday) : 0,
      startTime: shift.startTime.substring(0, 5), // Remove seconds: "09:00:00" -> "09:00"
      endTime: shift.endTime.substring(0, 5),
      createdAt: shift.createdAt,
    }));

    return new ApiResponseDto({
      success: true,
      message: 'Staff shifts retrieved.',
      data: transformedShifts,
    });
  }

  async updateShift(shiftId: number, dto: UpdateShiftDto) {
    const shift = await this.shiftRepository.findOne({ 
      where: { id: shiftId },
      relations: ['staff', 'shiftDays'],
    });
    
    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }

    // Update staff member if staffId is provided
    if (dto.staffId !== undefined && dto.staffId !== shift.staff?.id) {
      const newStaff = await this.staffRepository.findOne({ 
        where: { id: dto.staffId } 
      });
      if (!newStaff) {
        throw new NotFoundException(`Staff with ID ${dto.staffId} not found.`);
      }
      shift.staff = newStaff;
    }

    // Update shift times
    if (dto.startTime) {
      shift.startTime = dto.startTime + ':00';
    }
    if (dto.endTime) {
      shift.endTime = dto.endTime + ':00';
    }

    // Update weekday if provided
    if (dto.dayOfWeek !== undefined && shift.shiftDays && shift.shiftDays.length > 0) {
      shift.shiftDays[0].weekday = dto.dayOfWeek;
      await this.shiftDayRepository.save(shift.shiftDays[0]);
    }

    await this.shiftRepository.save(shift);

    return new ApiResponseDto({ success: true, message: 'Shift updated.', data: shift });
  }

  async deleteShift(shiftId: number) {
    const shift = await this.shiftRepository.findOne({ 
      where: { id: shiftId },
      relations: ['shiftDays'],
    });
    
    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }

    // Delete shift (cascade will handle shift_days due to entity config)
    await this.shiftRepository.remove(shift);
    
    return new ApiResponseDto({ success: true, message: 'Shift deleted.' });
  }
}
