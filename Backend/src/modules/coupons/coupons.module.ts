import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Spa } from '../spas/entities/spa.entity';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Spa])],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService, TypeOrmModule],
})
export class CouponsModule {}
