import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting) private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async create(dto: CreateSystemSettingDto) {
    const entity = this.systemSettingRepository.create({
      key: dto.key,
      value: dto.value,
      description: dto.description ?? null,
    });
    const saved = await this.systemSettingRepository.save(entity);
    return new ApiResponseDto({ success: true, message: 'Setting created.', data: saved });
  }

  async findAll() {
    const settings = await this.systemSettingRepository.find();
    return new ApiResponseDto({ success: true, message: 'Settings retrieved.', data: settings });
  }

  async findOne(key: string) {
    const setting = await this.systemSettingRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Setting not found.');
    }
    return new ApiResponseDto({ success: true, message: 'Setting retrieved.', data: setting });
  }

  async update(key: string, dto: UpdateSystemSettingDto) {
    const setting = await this.systemSettingRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Setting not found.');
    }

    Object.assign(setting, dto, { description: dto.description ?? setting.description });
    const saved = await this.systemSettingRepository.save(setting);
    return new ApiResponseDto({ success: true, message: 'Setting updated.', data: saved });
  }

  async remove(key: string) {
    const setting = await this.systemSettingRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Setting not found.');
    }
    await this.systemSettingRepository.remove(setting);
    return new ApiResponseDto({ success: true, message: 'Setting removed.' });
  }
}
