import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorites.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Spa } from '../spas/entities/spa.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
  ) {}

  async findAll(customerId: number): Promise<Favorite[]> {
    const favorites = await this.favoritesRepository.find({
      where: { customerId },
      relations: ['spa'],
      order: { createdAt: 'DESC' }, // Most recently added first
    });

    return favorites;
  }

  async create(customerId: number, createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    // Check if already favorited
    const existing = await this.favoritesRepository.findOne({
      where: { customerId, spaId: createFavoriteDto.spaId },
    });

    if (existing) {
      throw new ConflictException('Spa is already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      customerId,
      spaId: createFavoriteDto.spaId,
    });

    return await this.favoritesRepository.save(favorite);
  }

  async remove(customerId: number, spaId: number): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { customerId, spaId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async isFavorite(customerId: number, spaId: number): Promise<boolean> {
    const count = await this.favoritesRepository.count({
      where: { customerId, spaId },
    });

    return count > 0;
  }

  // Sync favorites from localStorage to database (migration)
  async syncFavorites(customerId: number, spaIds: number[]): Promise<Favorite[]> {
    const results: Favorite[] = [];

    for (const spaId of spaIds) {
      try {
        // Check if already exists
        const existing = await this.favoritesRepository.findOne({
          where: { customerId, spaId },
        });

        if (!existing) {
          const favorite = this.favoritesRepository.create({
            customerId,
            spaId,
          });
          const saved = await this.favoritesRepository.save(favorite);
          results.push(saved);
        }
      } catch {
        // Skip failed syncs silently
      }
    }

    return results;
  }

  // Get favorite IDs only (for quick checks)
  async getFavoriteIds(customerId: number): Promise<number[]> {
    const favorites = await this.favoritesRepository.find({
      where: { customerId },
      select: ['spaId'],
    });

    return favorites.map(f => f.spaId);
  }
}
