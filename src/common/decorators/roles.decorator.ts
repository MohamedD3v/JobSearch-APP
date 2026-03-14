import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/enums';

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Roles[]) =>
  SetMetadata(ROLES_KEY, roles);
