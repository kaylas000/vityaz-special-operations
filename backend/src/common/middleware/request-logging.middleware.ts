import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, path, query, body } = req;
    const userAgent = req.get('user-agent') || 'Unknown';
    const userId = (req as any).user?.id || 'Anonymous';

    // Log incoming request
    this.loggerService.info(
      `Incoming ${method} ${path}`,
      'HTTP',
      {
        method,
        path,
        query,
        userId,
        userAgent,
        // Don't log password fields
        body: this.sanitizeBody(body),
      }
    );

    // Override res.end to capture response
    const originalEnd = res.end;

    res.end = function (...args: any[]) {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;

      // Log outgoing response
      if (statusCode >= 400) {
        this.loggerService.warn(
          `Response ${statusCode} - ${method} ${path} (${duration}ms)`,
          'HTTP',
          { statusCode, duration, userId }
        );
      } else {
        this.loggerService.info(
          `Response ${statusCode} - ${method} ${path} (${duration}ms)`,
          'HTTP',
          { statusCode, duration, userId }
        );
      }

      // Log performance warnings
      if (duration > 1000) {
        this.loggerService.warn(
          `Slow request: ${method} ${path} took ${duration}ms`,
          'Performance',
          { method, path, duration, userId }
        );
      }

      originalEnd.apply(res, args);
    }.bind(this);

    next();
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'privateKey',
      'secret',
      'token',
      'apiKey',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
