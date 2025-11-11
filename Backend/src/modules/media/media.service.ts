import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media, MediaRelatedType } from './entities/media.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private readonly mediaRepository: Repository<Media>) {}

  async create(dto: CreateMediaDto) {
    const media = this.mediaRepository.create(dto);
    await this.mediaRepository.save(media);

    return new ApiResponseDto({ success: true, message: 'Media created.', data: media });
  }

  async findAll() {
    const media = await this.mediaRepository.find({ order: { createdAt: 'DESC' } });
    return new ApiResponseDto({ success: true, message: 'Media retrieved.', data: media });
  }

  async findOne(id: number) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Media retrieved.', data: media });
  }

  async findByRelated(relatedType: MediaRelatedType, relatedId: number) {
    const media = await this.mediaRepository.find({
      where: { relatedType, relatedId },
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'Media retrieved.', data: media });
  }

  async findBySpa(spaId: number) {
    return this.findByRelated(MediaRelatedType.SPA, spaId);
  }

  async findByService(serviceId: number) {
    return this.findByRelated(MediaRelatedType.SERVICE, serviceId);
  }

  async findByPost(postId: number) {
    return this.findByRelated(MediaRelatedType.POST, postId);
  }

  async findByUser(userId: number) {
    return this.findByRelated(MediaRelatedType.USER, userId);
  }

  async getUserAvatar(userId: number) {
    const media = await this.mediaRepository.findOne({
      where: { relatedType: MediaRelatedType.USER, relatedId: userId, tag: 'avatar' },
      order: { createdAt: 'DESC' },
    });
    return media ? new ApiResponseDto({ success: true, message: 'User avatar retrieved.', data: media }) 
      : new ApiResponseDto({ success: false, message: 'User avatar not found.', data: null });
  }

  async getSpaAvatar(spaId: number) {
    const media = await this.mediaRepository.findOne({
      where: { relatedType: MediaRelatedType.SPA, relatedId: spaId, tag: 'avatar' },
      order: { createdAt: 'DESC' },
    });
    return media ? new ApiResponseDto({ success: true, message: 'Spa avatar retrieved.', data: media })
      : new ApiResponseDto({ success: false, message: 'Spa avatar not found.', data: null });
  }

  async getSpaBackground(spaId: number) {
    const media = await this.mediaRepository.findOne({
      where: { relatedType: MediaRelatedType.SPA, relatedId: spaId, tag: 'background' },
      order: { createdAt: 'DESC' },
    });
    return media ? new ApiResponseDto({ success: true, message: 'Spa background retrieved.', data: media })
      : new ApiResponseDto({ success: false, message: 'Spa background not found.', data: null });
  }

  async remove(id: number) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found.');
    }

    await this.mediaRepository.delete(id);

    return new ApiResponseDto({ success: true, message: 'Media removed.' });
  }

  async upload(file: Express.Multer.File, relatedType: MediaRelatedType, relatedId: number, tag?: string) {
    if (!file) {
      throw new Error('No file provided');
    }

    // File đã được lưu bởi multer, chỉ cần tạo URL
    const url = `/uploads/${file.filename}`;

    // Nếu có tag và là avatar/background, xóa các media cũ cùng type
    if (tag && (tag === 'avatar' || tag === 'background')) {
      const oldMedia = await this.mediaRepository.find({
        where: { relatedType, relatedId, tag },
      });
      if (oldMedia.length > 0) {
        await this.mediaRepository.remove(oldMedia);
      }
    }

    const media = this.mediaRepository.create({
      relatedType,
      relatedId,
      url,
      tag: tag || null,
    });

    await this.mediaRepository.save(media);

    return new ApiResponseDto({ success: true, message: 'File uploaded successfully.', data: media });
  }

  async uploadUserAvatar(file: Express.Multer.File, userId: number) {
    return this.upload(file, MediaRelatedType.USER, userId, 'avatar');
  }

  async uploadSpaAvatar(file: Express.Multer.File, spaId: number) {
    return this.upload(file, MediaRelatedType.SPA, spaId, 'avatar');
  }

  async uploadSpaBackground(file: Express.Multer.File, spaId: number) {
    return this.upload(file, MediaRelatedType.SPA, spaId, 'background');
  }

  async getHomepageImage(tag: string) {
    const media = await this.mediaRepository.findOne({
      where: { relatedType: MediaRelatedType.HOMEPAGE, tag },
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ 
      success: true, 
      message: 'Homepage image retrieved.', 
      data: media || null 
    });
  }

  async uploadHomepageImage(file: Express.Multer.File, tag: string) {
    // Use relatedId = 0 for homepage (no specific entity)
    return this.upload(file, MediaRelatedType.HOMEPAGE, 0, tag);
  }
}

