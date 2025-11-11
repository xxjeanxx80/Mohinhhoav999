import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ServiceType } from '../entities/service.entity';

export class CreateServiceDto {
  @ApiProperty({ description: 'Display name of the service.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Description of the service.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base price for the service.' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Duration of the service in minutes.' })
  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({ enum: ServiceType, default: ServiceType.AT_SPA })
  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @ApiProperty({ description: 'Identifier of the spa offering the service.' })
  @IsInt()
  spaId: number;
}
