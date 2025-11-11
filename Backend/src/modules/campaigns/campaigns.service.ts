import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(@InjectRepository(Campaign) private readonly campaignRepository: Repository<Campaign>) {}

  async create(dto: CreateCampaignDto) {
    const campaign = this.campaignRepository.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      isActive: dto.isActive ?? true,
      spa: dto.spaId ? { id: dto.spaId } as any : null,
    });

    const saved = await this.campaignRepository.save(campaign);
    const campaignWithRelations = await this.campaignRepository.findOne({
      where: { id: saved.id },
      relations: ['spa'],
    });
    return new ApiResponseDto({ success: true, message: 'Campaign created.', data: campaignWithRelations });
  }

  async findAll() {
    const campaigns = await this.campaignRepository.find({
      relations: ['spa'],
    });
    return new ApiResponseDto({ success: true, message: 'Campaigns retrieved.', data: campaigns });
  }

  async findOne(id: number) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['spa'],
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Campaign retrieved.', data: campaign });
  }

  async update(id: number, dto: UpdateCampaignDto) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    Object.assign(campaign, dto, {
      startsAt: dto.startsAt ? new Date(dto.startsAt) : campaign.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : campaign.endsAt,
      spa: dto.spaId !== undefined ? (dto.spaId ? { id: dto.spaId } as any : null) : campaign.spa,
    });

    const saved = await this.campaignRepository.save(campaign);
    const campaignWithRelations = await this.campaignRepository.findOne({
      where: { id: saved.id },
      relations: ['spa'],
    });
    return new ApiResponseDto({ success: true, message: 'Campaign updated.', data: campaignWithRelations });
  }

  async remove(id: number) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    await this.campaignRepository.delete(id);
    return new ApiResponseDto({ success: true, message: 'Campaign removed.' });
  }
}
