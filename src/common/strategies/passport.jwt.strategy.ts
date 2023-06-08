import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
      passReqToCallback: true,
    });
  }
  async validate(req: Request, jwtPayload: JwtPayload) {
    const payload = {
      id: jwtPayload.id,
      account: jwtPayload.account,
      name: jwtPayload.name,
      role: jwtPayload.role,
    };

    if (this.needRefreshToken(jwtPayload.iat)) {
      this.usersService.signJwt(req, payload);
    }

    return payload;
  }

  needRefreshToken = (iat: number): boolean => {
    const REFRESH_THRESHOLD_MINUTE = 10;

    const lapsedMinutes = (Date.now() / 1000 - iat) / 60;
    return lapsedMinutes > REFRESH_THRESHOLD_MINUTE;
  };
}

const cookieExtractor = (req: Request): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  return req.cookies.itvToken;
};
