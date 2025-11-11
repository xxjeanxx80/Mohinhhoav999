import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ description: 'Name of the staff member.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Spa identifier the staff belongs to.' })
  @IsInt()
  spaId: number;

  @ApiProperty({ required: false, description: 'Skill tags assigned to the staff member.' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}
