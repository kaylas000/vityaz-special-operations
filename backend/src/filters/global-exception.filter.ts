import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string | string[];
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string | string[];
    let error: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || exception.message;
        error = exceptionResponse['error'] || 'HttpException';
        details = exceptionResponse['details'];
      } else {
        message = exceptionResponse;
        error = 'HttpException';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = exception.name || 'InternalServerError';
      message = exception.message;

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'InternalServerError';
      message = 'An unexpected error occurred';

      this.logger.error(
        'Unknown error type',
        exception,
        `${request.method} ${request.url}`
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Log error based on status
    if (status >= 500) {
      this.logger.error(
        JSON.stringify(errorResponse),
        'GlobalExceptionFilter'
      );
    } else if (status >= 400) {
      this.logger.warn(
        JSON.stringify(errorResponse),
        'GlobalExceptionFilter'
      );
    }

    response.status(status).json(errorResponse);
  }
}
