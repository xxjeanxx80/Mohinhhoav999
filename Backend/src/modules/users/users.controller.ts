import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoyaltyRank } from './enums/loyalty-rank.enum';
import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';

@ApiBearerAuth('Authorization')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @Auth(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('customers/owner/me')
  @Auth(Role.OWNER)
  findCustomersByOwner(@Req() req: Request) {
    const user = req.user as { id: number; email: string; role: string };
    return this.usersService.findCustomersByOwner(user.id);
  }

  @Get('me')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  getCurrentUser(@Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    return this.usersService.findOne(currentUser.id);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only access your own profile.');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    // Customer and Owner can only update their own profile, Admin can update any
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    // Don't allow password update through this endpoint - use change-password endpoint instead
    if (dto.password) {
      throw new ForbiddenException('Use /users/:id/change-password endpoint to change password.');
    }
    return this.usersService.update(id, dto);
  }

  @Post(':id/change-password')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  changePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangePasswordDto, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    // Customer and Owner can only change their own password, Admin can change any
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only change your own password.');
    }
    return this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/loyalty/points')
  @Auth(Role.ADMIN)
  addPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body('points', ParseIntPipe) points: number,
    @Body('reason') reason: string,
  ) {
    return this.usersService.addPoints(id, points, reason);
  }

  @Get(':id/loyalty/rank')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  getRank(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only access your own loyalty rank.');
    }
    return this.usersService.getRank(id);
  }

  @Patch(':id/loyalty/rank')
  @Auth(Role.OWNER, Role.ADMIN)
  updateLoyaltyRank(@Param('id', ParseIntPipe) id: number, @Body('loyaltyRank') rank: LoyaltyRank) {
    return this.usersService.updateLoyaltyRank(id, rank);
  }

  @Get(':id/bookings')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  getUserBookings(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only access your own bookings.');
    }
    return this.usersService.getUserBookings(id);
  }

  @Get(':id/feedbacks')
  @Auth(Role.ADMIN, Role.CUSTOMER, Role.OWNER)
  getUserFeedbacks(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only access your own feedbacks.');
    }
    return this.usersService.getUserFeedbacks(id);
  }

  @Get('loyalty/history/:userId')
  @Auth(Role.ADMIN, Role.CUSTOMER)
  getLoyaltyHistory(@Param('userId', ParseIntPipe) userId: number, @Req() req: Request) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException('You can only access your own loyalty history.');
    }
    return this.usersService.getLoyaltyHistory(userId);
  }

  @Post(':id/avatar')
  @Auth(Role.CUSTOMER, Role.OWNER, Role.ADMIN)
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
          cb(null, `avatar-${uniqueSuffix}${ext}`);
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
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const currentUser = req.user as { id: number; role: Role } | undefined;
    if (!currentUser) {
      throw new ForbiddenException('Authentication context is missing.');
    }
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own avatar.');
    }
    return this.usersService.updateAvatar(id, file, this.mediaService);
  }
}
