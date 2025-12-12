import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logDir = 'logs';
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${context || 'APP'}] ${message}`;
    console.log(logMessage);
    this.writeToFile('app.log', logMessage);
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] [${context || 'APP'}] ${message}\n${trace || ''}`;
    console.error(logMessage);
    this.writeToFile('error.log', logMessage);
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] [${context || 'APP'}] ${message}`;
    console.warn(logMessage);
    this.writeToFile('warn.log', logMessage);
  }

  debug(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DEBUG] [${context || 'APP'}] ${message}`;
    if (process.env.NODE_ENV === 'development') {
      console.debug(logMessage);
    }
    this.writeToFile('debug.log', logMessage);
  }

  verbose(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [VERBOSE] [${context || 'APP'}] ${message}`;
    console.log(logMessage);
    this.writeToFile('verbose.log', logMessage);
  }

  private writeToFile(filename: string, message: string) {
    const filepath = path.join(this.logDir, filename);
    
    // Check file size and rotate if needed
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > this.maxFileSize) {
        const backupPath = `${filepath}.${Date.now()}`;
        fs.renameSync(filepath, backupPath);
      }
    }

    fs.appendFileSync(filepath, message + '\n', 'utf8');
  }
}
