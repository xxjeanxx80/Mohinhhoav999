import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { Spa } from '../spas/entities/spa.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
  ) {}

  async create(dto: CreateCouponDto, userId: number, userRole: string) {
    const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Coupon code already exists.');
    }

    let spa: Spa | null = null;
    
    // If OWNER, find their spa and link coupon to it
    if (userRole === 'OWNER') {
      const spas = await this.spaRepository.find({ 
        where: { owner: { id: userId } },
        take: 1 
      });
      if (spas.length > 0) {
        spa = spas[0];
      }
    }
    // ADMIN creates global coupons (spa = null)

    const coupon = this.couponRepository.create({
      ...dto,
      spa: spa,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.couponRepository.save(coupon);
    return new ApiResponseDto({ success: true, message: 'Coupon created.', data: saved });
  }

  async findAll() {
    const coupons = await this.couponRepository.find();
    return new ApiResponseDto({ success: true, message: 'Coupons retrieved.', data: coupons });
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Coupon retrieved.', data: coupon });
  }

  async validateCoupon(code: string) {
    if (!code || !code.trim()) {
      throw new BadRequestException('Coupon code is required.');
    }

    const coupon = await this.couponRepository.findOne({ where: { code: code.trim().toUpperCase() } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active.');
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Coupon has expired.');
    }

    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon has reached maximum redemptions.');
    }

    return new ApiResponseDto({ 
      success: true, 
      message: 'Coupon is valid.', 
      data: {
        id: coupon.id,
        code: coupon.code,
        discountValue: coupon.discountPercent,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
      }
    });
  }

  async update(id: number, dto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    Object.assign(coupon, dto, {
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : coupon.expiresAt,
    });

    const saved = await this.couponRepository.save(coupon);
    return new ApiResponseDto({ success: true, message: 'Coupon updated.', data: saved });
  }

  async remove(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    await this.couponRepository.delete(id);
    return new ApiResponseDto({ success: true, message: 'Coupon removed.' });
  }

  async findByOwner(ownerId: number) {
    const coupons = await this.couponRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.spa', 'spa')
      .leftJoinAndSelect('spa.owner', 'owner')
      .where('(owner.id = :ownerId OR coupon.spa IS NULL)', { ownerId }) // ✅ Fixed: wrap in parentheses
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();

    return new ApiResponseDto({
      success: true,
      message: 'Owner coupons retrieved.',
      data: coupons,
    });
  }
}
