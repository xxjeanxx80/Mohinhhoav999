import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService, AuthenticatedUser, AuthTokens } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ApiResponseDto<{ user: AuthenticatedUser; tokens: AuthTokens }>> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ): Promise<ApiResponseDto<{ user: AuthenticatedUser; tokens: AuthTokens }>> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<ApiResponseDto<{ tokens: AuthTokens }>> {
    return this.authService.refreshTokens(dto);
  }
}
