import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpasModule } from '../spas/spas.module';
import { Spa } from '../spas/entities/spa.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { SpaService } from './entities/service.entity';

@Module({
  imports: [SpasModule, TypeOrmModule.forFeature([SpaService, Spa])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
