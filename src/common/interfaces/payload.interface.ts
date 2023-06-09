export interface Payload {
  id: number;
  account: string;
  name: string;
}

// dev용
export interface JwtPayload extends Payload {
  iat: number;
  exp: number;
}
