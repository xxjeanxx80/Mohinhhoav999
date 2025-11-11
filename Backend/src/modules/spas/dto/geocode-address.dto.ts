import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GeocodeAddressDto {
  @ApiProperty({ description: 'Address to geocode' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

