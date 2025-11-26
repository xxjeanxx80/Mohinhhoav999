import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Logger
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @Auth(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get all favorites for current customer' })
  @ApiResponse({ status: 200, description: 'Returns list of favorite spas' })
  async findAll(@Req() req: Request) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Getting favorites for user ${user.id}`);
    const favorites = await this.favoritesService.findAll(user.id);
    
    // Return array directly - interceptor will wrap with { success, message, data }
    return favorites.map(fav => ({
      id: fav.id,
      spaId: fav.spaId,
      spa: fav.spa,
      createdAt: fav.createdAt,
    }));
  }

  @Get('ids')
  @Auth(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get favorite spa IDs only' })
  @ApiResponse({ status: 200, description: 'Returns array of favorite spa IDs' })
  async getFavoriteIds(@Req() req: Request) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Getting favorite IDs for user ${user.id}`);
    const ids = await this.favoritesService.getFavoriteIds(user.id);
    
    // Return array directly - interceptor will wrap with { success, message, data }
    return ids;
  }

  @Post()
  @Auth(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add spa to favorites' })
  @ApiResponse({ status: 201, description: 'Spa added to favorites' })
  async create(@Req() req: Request, @Body() createFavoriteDto: CreateFavoriteDto) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Adding spa ${createFavoriteDto.spaId} to favorites for user ${user.id}`);
    const favorite = await this.favoritesService.create(user.id, createFavoriteDto);
    
    return {
      success: true,
      message: 'Spa added to favorites',
      data: {
        id: favorite.id,
        spaId: favorite.spaId,
        createdAt: favorite.createdAt,
      }
    };
  }

  @Delete(':spaId')
  @Auth(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove spa from favorites' })
  @ApiResponse({ status: 200, description: 'Spa removed from favorites' })
  async remove(@Req() req: Request, @Param('spaId', ParseIntPipe) spaId: number) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Removing spa ${spaId} from favorites for user ${user.id}`);
    await this.favoritesService.remove(user.id, spaId);
    
    return {
      success: true,
      message: 'Spa removed from favorites',
    };
  }

  @Post('sync')
  @Auth(Role.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync favorites from localStorage to database' })
  @ApiResponse({ status: 200, description: 'Favorites synced successfully' })
  async syncFavorites(@Req() req: Request, @Body() body: { spaIds: number[] }) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Syncing ${body.spaIds?.length || 0} favorites for user ${user.id}`);
    const syncedFavorites = await this.favoritesService.syncFavorites(user.id, body.spaIds || []);
    
    return {
      success: true,
      message: `Synced ${syncedFavorites.length} favorites`,
      data: syncedFavorites.map(fav => ({
        id: fav.id,
        spaId: fav.spaId,
        createdAt: fav.createdAt,
      }))
    };
  }

  @Get('check/:spaId')
  @Auth(Role.CUSTOMER)
  @ApiOperation({ summary: 'Check if spa is in favorites' })
  @ApiResponse({ status: 200, description: 'Returns favorite status' })
  async isFavorite(@Req() req: Request, @Param('spaId', ParseIntPipe) spaId: number) {
    const user = req.user as { id: number; role: Role } | undefined;
    if (!user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.debug(`Checking if spa ${spaId} is favorite for user ${user.id}`);
    const isFav = await this.favoritesService.isFavorite(user.id, spaId);
    
    return {
      success: true,
      data: { isFavorite: isFav },
    };
  }
}
