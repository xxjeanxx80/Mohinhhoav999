import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Nam Nguyen' })
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'nam@example.com' })
  @IsEmail()
  @Length(5, 100)
  email: string;

  @ApiProperty({ example: '+84123456789', required: false })
  @IsOptional()
  @Length(8, 20)
  phone?: string;

  @ApiProperty({example: '175 Tay son', required: false })
  @IsOptional()
  @Length(5, 255)
  address?: string;
}
