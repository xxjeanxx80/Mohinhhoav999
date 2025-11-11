import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Spa } from './entities/spa.entity';
import { SpasController } from './spas.controller';
import { SpasService } from './spas.service';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { GeocodingService } from './services/geocoding.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Spa, User, SpaService, Staff]),
    MediaModule,
  ],
  controllers: [SpasController],
  providers: [SpasService, GeocodingService],
  exports: [SpasService, GeocodingService],
})
export class SpasModule {}
