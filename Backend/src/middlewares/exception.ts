import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseObj = exception.getResponse() as {
      message: any;
      error: string;
      statusCode: number;
    };
    responseObj.message =
      Array.isArray(responseObj.message) && responseObj.message.length
        ? responseObj.message[0]
        : responseObj.message;
    response.status(status).json(responseObj);
  }
}
