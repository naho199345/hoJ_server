import { LoggerService } from '@nestjs/common';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = path.join(__dirname, '..', '..', '..', 'external-vol/innerviewon-server', 'logs');

const commonConfig = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '28d',
};

const transportInfo = new winston.transports.DailyRotateFile({
  ...commonConfig,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format((info) => (info.level === 'info' ? info : false))(),
  ),
  filename: `${logDir}/log/%DATE%.log`,
});

const transportError = new winston.transports.DailyRotateFile({
  ...commonConfig,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format((info) => (info.level === 'error' ? info : false))(),
  ),
  filename: `${logDir}/error/%DATE%.log`,
});

export const winstonLogger = (): LoggerService => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          nestWinstonModuleUtilities.format.nestLike('innerviewon', {
            prettyPrint: true,
          }),
        ),
      }),
      transportInfo,
      transportError,
    ],
  });
};
