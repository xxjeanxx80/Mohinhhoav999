import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { MediaRelatedType } from '../entities/media.entity';

export class CreateMediaDto {
  @IsEnum(MediaRelatedType)
  @IsNotEmpty()
  relatedType: MediaRelatedType;

  @IsInt()
  @IsNotEmpty()
  relatedId: number;

  @IsString()
  @IsNotEmpty()
  url: string;
}

