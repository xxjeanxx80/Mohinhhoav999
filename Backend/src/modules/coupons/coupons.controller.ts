import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsService } from './coupons.service';

@ApiTags('coupons')
@ApiBearerAuth('Authorization')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Auth(Role.ADMIN, Role.OWNER)
  create(@Req() req: Request, @Body() dto: CreateCouponDto) {
    const user = req.user as { id: number; role: string };
    return this.couponsService.create(dto, user.id, user.role);
  }

  @Get()
  @Auth(Role.ADMIN, Role.OWNER)
  findAll(@Req() req: Request) {
    const user = req.user as { id: number; role: string };
    // If OWNER, filter by their spas only
    if (user.role === Role.OWNER) {
      return this.couponsService.findByOwner(user.id);
    }
    // ADMIN sees all
    return this.couponsService.findAll();
  }

  @Get('public')
  getPublicCoupons() {
    return this.couponsService.getPublicCoupons();
  }

  @Get('validate')
  validateCoupon(@Query('code') code: string) {
    return this.couponsService.validateCoupon(code);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
