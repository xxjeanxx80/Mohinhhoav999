import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Previously issued refresh token.' })
  @IsString()
  @MinLength(10)
  refreshToken: string;
}
