import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaRelatedType } from './entities/media.entity';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth('Authorization')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @Auth(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto);
  }

  @Post('upload')
  @Auth(Role.OWNER, Role.ADMIN, Role.CUSTOMER)
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
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('relatedType') relatedType: MediaRelatedType,
    @Body('relatedId') relatedId: string,
  ) {
    return this.mediaService.upload(file, relatedType, parseInt(relatedId, 10));
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Get('spa/:spaId')
  findBySpa(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.mediaService.findBySpa(spaId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId', ParseIntPipe) serviceId: number) {
    return this.mediaService.findByService(serviceId);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.mediaService.findByPost(postId);
  }

  @Delete(':id')
  @Auth(Role.OWNER, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  @Get('user/:userId/avatar')
  getUserAvatar(@Param('userId', ParseIntPipe) userId: number) {
    return this.mediaService.getUserAvatar(userId);
  }

  @Get('spa/:spaId/avatar')
  getSpaAvatar(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.mediaService.getSpaAvatar(spaId);
  }

  @Get('spa/:spaId/background')
  getSpaBackground(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.mediaService.getSpaBackground(spaId);
  }

  @Get('homepage/:tag')
  getHomepageImage(@Param('tag') tag: string) {
    return this.mediaService.getHomepageImage(tag);
  }

  @Post('homepage/:tag')
  @Auth(Role.ADMIN)
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
          cb(null, `homepage-${req.params.tag}-${uniqueSuffix}${ext}`);
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
  uploadHomepageImage(
    @Param('tag') tag: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.uploadHomepageImage(file, tag);
  }
}

