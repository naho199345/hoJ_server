import { Injectable, Logger, NestMiddleware, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('LoggerMiddleware');

  use(@Req() req: Request, @Res() res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;

    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;

      this.logger.log(`[${method}] {${originalUrl}} ${statusCode} - ${userAgent} { IP: ${ip} }`);
    });

    next();
  }
}
