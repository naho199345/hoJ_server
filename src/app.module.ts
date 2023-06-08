import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

const NODE_ENV = process.env.NODE_ENV || 'dev';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${NODE_ENV}`,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_ACCESS_TOKEN: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRES: Joi.number().required(),
        JWT_RESET_TOKEN_EXPIRES: Joi.number().required(),
      }),
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: +process.env.DB_PORT,
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   entities: [User, Room, Assignment],
    //   synchronize: false,
    //   namingStrategy: new SnakeNamingStrategy(),
    // }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.NODE_ENV !== 'dev') consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
