import { Injectable, Logger as NestLogger } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private nestLogger = new NestLogger('LoggerService');

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        });
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'vityaz-api' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),

        // Daily rotate file for info logs
        new DailyRotateFile({
          filename: 'logs/info-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxDays: '30d',
          level: 'info',
        }),

        // Daily rotate file for errors
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxDays: '30d',
          level: 'error',
        }),
      ],
      exceptionHandlers: [
        new DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxDays: '30d',
        }),
      ],
    });
  }

  debug(message: string, context?: string, data?: any) {
    this.logger.debug(message, { context, data });
  }

  info(message: string, context?: string, data?: any) {
    this.logger.info(message, { context, data });
    if (process.env.NODE_ENV === 'development') {
      this.nestLogger.log(`[${context}] ${message}`);
    }
  }

  warn(message: string, context?: string, data?: any) {
    this.logger.warn(message, { context, data });
    if (process.env.NODE_ENV === 'development') {
      this.nestLogger.warn(`[${context}] ${message}`);
    }
  }

  error(message: string, error?: Error, context?: string, data?: any) {
    const stack = error?.stack || new Error().stack;
    this.logger.error(message, { context, data, stack });
    if (process.env.NODE_ENV === 'development') {
      this.nestLogger.error(`[${context}] ${message}`, error?.stack);
    }
  }

  // Business logic logging
  logUserAction(userId: string, action: string, details?: any) {
    this.info(`User action: ${action}`, 'UserAction', { userId, details });
  }

  logBattleEvent(battleId: string, event: string, details?: any) {
    this.info(`Battle event: ${event}`, 'BattleEvent', { battleId, details });
  }

  logTokenTransaction(
    fromUser: string,
    toUser: string,
    amount: number,
    type: string
  ) {
    this.info(`Token transaction: ${type}`, 'TokenTransaction', {
      from: fromUser,
      to: toUser,
      amount,
    });
  }

  logPerformance(operation: string, duration: number, details?: any) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger[level](
      `Operation performance: ${operation} took ${duration}ms`,
      {
        operation,
        duration,
        details,
      }
    );
  }

  logSecurityEvent(event: string, details?: any) {
    this.warn(`Security event: ${event}`, 'SecurityEvent', details);
  }
}
