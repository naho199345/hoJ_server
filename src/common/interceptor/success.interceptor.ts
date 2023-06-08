import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { camelCase } from 'change-case';
import { ObjectType } from '../interfaces/ObjectType';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        this.camelizeKey(data);
        return {
          success: true,
          data,
        };
      }),
    );
  }

  private camelizeKey = (data: unknown): void => {
    if (Array.isArray(data)) {
      for (const subData of data) {
        this.camelizeKey(subData);
      }
    }
    if (this.isObject(data)) {
      Object.entries(data).forEach(([key, value]) => {
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (camelCase(key) && camelCase(key) !== key && !korean.test(key)) {
          data[camelCase(key)] = value;
          delete data[key];
        }
      });
    }
  };
  private isObject = <T>(value: T): value is T & ObjectType => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  };
}
