import { Role } from '../enums/Role';

export interface Payload {
  id: number;
  account: string;
  name: string;
  role: Role;
}

// dev용
export interface JwtPayload extends Payload {
  iat: number;
  exp: number;
}
