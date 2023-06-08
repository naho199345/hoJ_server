import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { hoJMiddleware } from './common/middlewares/hoJ.middleware';
import { swagger } from './common/middlewares/swagger.middleware';
import { GlobalExceptionFilter } from './common/exceptions/httpException.filter';
import { winstonLogger } from './common/utils/winston.logger';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger(),
  });

  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  hoJMiddleware(app);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  swagger(app);
  await app.listen(process.env.PORT || 3000);

  return app.getUrl();
}
(async (): Promise<void> => {
  try {
    const url = await bootstrap();
    console.log(`Application is running on: ${url}`);
  } catch (error) {
    console.log(`[Error] bootstrap ${error}`);
  }
})();
