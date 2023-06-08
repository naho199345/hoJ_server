import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();
      if (typeof responseMessage === 'object' && responseMessage !== null) {
        message = (responseMessage as any)['message'] || '';
      } else if (typeof responseMessage === 'string') {
        message = responseMessage;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
    } else if (typeof exception === 'object' && exception !== null) {
      const anyException = exception as any;
      message = anyException.message || '';
    }

    response.status(status).json({
      success: false,
      response: {
        statusCode: status,
        message: message,
        error: (exception as any).name || '',
      },
    });
  }
}
