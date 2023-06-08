import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import type { INestApplication } from '@nestjs/common';

export function hoJMiddleware(app: INestApplication): INestApplication {
  app.use(cookieParser());

  app.use(morgan('dev'));

  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  return app;
}
