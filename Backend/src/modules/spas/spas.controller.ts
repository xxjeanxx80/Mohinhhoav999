import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApproveSpaDto } from './dto/approve-spa.dto';
import { CreateSpaDto } from './dto/create-spa.dto';
import { UpdateSpaDto } from './dto/update-spa.dto';
import { NearbySpaDto } from './dto/nearby-spas.dto';
import { GeocodeAddressDto } from './dto/geocode-address.dto';
import { SpasService } from './spas.service';
import { GeocodingService } from './services/geocoding.service';
import { MediaService } from '../media/media.service';

@ApiTags('spas')
@Controller('spas')
export class SpasController {
  private readonly logger = new Logger(SpasController.name);

  constructor(
    private readonly spasService: SpasService,
    private readonly geocodingService: GeocodingService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER)
  create(@Req() req: Request, @Body() dto: CreateSpaDto) {
    const user = req.user as { id: number; email: string; role: string };
    return this.spasService.create(user.id, dto);
  }

  @Get()
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN)
  findAll() {
    return this.spasService.findAll();
  }

  @Get('public/featured')
  findFeatured() {
    return this.spasService.findFeatured();
  }

  @Get('nearby')
  findNearby(@Query() dto: NearbySpaDto) {
    return this.spasService.findNearby(dto);
  }

  @Get('public/:id')
  findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.spasService.findOnePublic(id);
  }

  @Get('mine')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER)
  findMine(@Req() req: Request) {
    const user = req.user as { id: number; email: string; role: string };
    this.logger.debug(`Finding spas for owner ${user.id}`);
    return this.spasService.findByOwner(user.id);
  }

  @Get(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.spasService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN, Role.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpaDto) {
    return this.spasService.update(id, dto);
  }

  @Patch(':id/approval')
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN)
  approve(@Param('id', ParseIntPipe) id: number, @Body() dto: ApproveSpaDto) {
    return this.spasService.approve(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.spasService.remove(id);
  }

  @Get(':id/services')
  getSpaServices(@Param('id', ParseIntPipe) id: number) {
    return this.spasService.getSpaServices(id);
  }

  @Get(':id/staff')
  getSpaStaff(@Param('id', ParseIntPipe) id: number) {
    return this.spasService.getSpaStaff(id);
  }

  @Post('geocode')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  async geocodeAddress(@Body() dto: GeocodeAddressDto) {
    const result = await this.geocodingService.geocodeAddress(dto.address);
    if (!result) {
      return {
        success: false,
        message: 'Không thể tìm thấy tọa độ cho địa chỉ này.',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Đã tìm thấy tọa độ thành công.',
      data: result,
    };
  }

  @Post(':id/avatar')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `spa-avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
        }
      },
    }),
  )
  uploadAvatar(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.spasService.updateAvatar(id, file, this.mediaService);
  }

  @Post(':id/background')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `spa-background-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for background images
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
        }
      },
    }),
  )
  uploadBackground(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.spasService.updateBackground(id, file, this.mediaService);
  }
}
