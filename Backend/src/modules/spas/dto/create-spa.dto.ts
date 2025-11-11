import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateSpaDto {
  @ApiProperty({ description: 'Display name of the spa.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Optional description of the spa.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Address of the spa location.' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false, description: 'Phone number of the spa.' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, description: 'Email address of the spa.' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: 'Opening time (HH:mm:ss format).' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'openingTime must be in HH:mm:ss format' })
  openingTime?: string;

  @ApiProperty({ required: false, description: 'Closing time (HH:mm:ss format).' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'closingTime must be in HH:mm:ss format' })
  closingTime?: string;
}
