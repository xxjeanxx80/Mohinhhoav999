import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Spa } from '../spas/entities/spa.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
  ) {}

  async create(dto: CreatePostDto) {
    const spa = await this.spaRepository.findOne({ where: { id: dto.spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const post = this.postRepository.create({
      spa,
      title: dto.title,
      content: dto.content,
      isPublished: dto.isPublished ?? false,
    });

    await this.postRepository.save(post);

    return new ApiResponseDto({ success: true, message: 'Post created.', data: post });
  }

  async findAll() {
    const posts = await this.postRepository.find({ relations: ['spa'] });
    return new ApiResponseDto({ success: true, message: 'Posts retrieved.', data: posts });
  }

  async findPublic() {
    const posts = await this.postRepository.find({
      where: { isPublished: true },
      relations: ['spa'],
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'Public posts retrieved.', data: posts });
  }

  async findOnePublic(id: number) {
    const post = await this.postRepository.findOne({
      where: { id, isPublished: true },
      relations: ['spa'],
    });
    if (!post) {
      throw new NotFoundException('Post not found or not published.');
    }

    return new ApiResponseDto({ success: true, message: 'Post retrieved.', data: post });
  }

  async findBySpa(spaId: number) {
    const posts = await this.postRepository.find({
      where: { spa: { id: spaId } },
      relations: ['spa'],
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'Spa posts retrieved.', data: posts });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ where: { id }, relations: ['spa'] });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Post retrieved.', data: post });
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    Object.assign(post, dto);
    await this.postRepository.save(post);

    return new ApiResponseDto({ success: true, message: 'Post updated.', data: post });
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    await this.postRepository.delete(id);

    return new ApiResponseDto({ success: true, message: 'Post removed.' });
  }
}

