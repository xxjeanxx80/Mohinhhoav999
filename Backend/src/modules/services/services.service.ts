import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { Spa } from '../spas/entities/spa.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { SpaService } from './entities/service.entity';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(SpaService) private readonly serviceRepository: Repository<SpaService>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
  ) {}

  async create(dto: CreateServiceDto, userId: number, userRole: Role) {
    this.logger.debug(`Creating service for spa ${dto.spaId} by user ${userId} (${userRole})`);
    
    const spa = await this.spaRepository.findOne({ 
      where: { id: dto.spaId },
      relations: ['owner'],
    });
    
    if (!spa || !spa.isApproved) {
      this.logger.warn(`Spa not found or not approved: ${dto.spaId}`);
      throw new NotFoundException('Spa not found or not approved.');
    }

    // ✅ Validate OWNER can only create services for their own spa
    if (userRole === Role.OWNER && spa.owner?.id !== userId) {
      this.logger.warn(`Forbidden: spa owner ${spa.owner?.id} != user ${userId}`);
      throw new ForbiddenException('You can only create services for your own spa.');
    }

    const service = this.serviceRepository.create({ ...dto, spa });
    await this.serviceRepository.save(service);

    return new ApiResponseDto({ success: true, message: 'Service created.', data: service });
  }

  async findAll() {
    const services = await this.serviceRepository.find();
    return new ApiResponseDto({ success: true, message: 'Services retrieved.', data: services });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Service retrieved.', data: service });
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    Object.assign(service, dto);
    await this.serviceRepository.save(service);

    return new ApiResponseDto({ success: true, message: 'Service updated.', data: service });
  }

  async remove(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    await this.serviceRepository.delete(id);

    return new ApiResponseDto({ success: true, message: 'Service removed.' });
  }

  async findBySpa(spaId: number) {
    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const services = await this.serviceRepository.find({
      where: { spa: { id: spaId } },
      relations: ['spa'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Services by spa retrieved.',
      data: { services },
    });
  }

  async findByOwner(ownerId: number) {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('service.createdAt', 'DESC')
      .getMany();

    return new ApiResponseDto({
      success: true,
      message: 'Owner services retrieved.',
      data: services,
    });
  }
}
