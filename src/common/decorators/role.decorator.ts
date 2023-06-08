import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/Role';

export const Roles = (...roles: Role[]) => SetMetadata('ROLES_KEY', roles);
