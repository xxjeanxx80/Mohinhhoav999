import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Roles } from './roles.decorator';

export function Auth(...roles: Role[]) {
  if (roles.length) {
    return applyDecorators(Roles(...roles), UseGuards(JwtGuard, RolesGuard));
  }

  return applyDecorators(UseGuards(JwtGuard, RolesGuard));
}
