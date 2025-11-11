import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbySpaDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(100)
  radius?: number = 10; // default 10km
}

