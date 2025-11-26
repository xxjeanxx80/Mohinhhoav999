import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorites.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Spa } from '../spas/entities/spa.entity';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
  ) {}

  async findAll(customerId: number): Promise<Favorite[]> {
    this.logger.log(`Finding all favorites for customer ${customerId}`);
    
    const favorites = await this.favoritesRepository.find({
      where: { customerId },
      relations: ['spa'],
      order: { createdAt: 'DESC' }, // Most recently added first
    });

    return favorites;
  }

  async create(customerId: number, createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    this.logger.log(`Adding spa ${createFavoriteDto.spaId} to favorites for customer ${customerId}`);

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
    this.logger.log(`Removing spa ${spaId} from favorites for customer ${customerId}`);

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
    this.logger.log(`Syncing ${spaIds.length} favorites for customer ${customerId}`);

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
      } catch (error) {
        this.logger.warn(`Failed to sync spa ${spaId} for customer ${customerId}:`, error);
      }
    }

    this.logger.log(`Successfully synced ${results.length} new favorites for customer ${customerId}`);
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
