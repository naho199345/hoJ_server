import { Role } from '../enums/Role';

export interface CreateGroup {
  account: string;
  name: string;
  role: Role;
}
