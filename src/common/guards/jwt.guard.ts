import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const headers = context.switchToHttp().getRequest().headers;
    if (headers.itvkey === process.env.JOJ_SECRET) {
      return true;
    }

    return super.canActivate(context);
  }

  public override handleRequest(err: any, user: any, info: any, context: any, status?: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException('로그인 후 다시 시도해주세요.');
    }
    return user;
  }
}
