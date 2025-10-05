/**
 * Centralized logging system
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  duration?: number;
}

class Logger {
  private level: LogLevel;
  private context: Record<string, any> = {};

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatMessage(level, message, context);
    
    // Console logging
    const levelName = LogLevel[level];
    const logMessage = `[${entry.timestamp}] ${levelName}: ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.context);
        break;
    }

    // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Performance logging
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // API request logging
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url}`, {
      statusCode,
      duration,
      userId,
      requestId,
    });
  }

  // User action logging
  logUserAction(
    action: string,
    userId: string,
    context?: Record<string, any>
  ): void {
    this.info(`User action: ${action}`, {
      userId,
      ...context,
    });
  }

  // Error logging with stack trace
  logError(error: Error, context?: Record<string, any>): void {
    this.error(error.message, {
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }
}

// Create logger instances
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN
);

export const apiLogger = new Logger(LogLevel.WARN);
export const userLogger = new Logger(LogLevel.INFO);
export const performanceLogger = new Logger(LogLevel.INFO);

// Performance monitoring
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static start(label: string): void {
    this.measurements.set(label, Date.now());
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`Performance measurement '${label}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(label);
    
    performanceLogger.info(`Performance: ${label}`, { duration });
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

// Error boundary logging
export function logErrorBoundary(error: Error, errorInfo: any): void {
  logger.error('React Error Boundary caught an error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
}

// API response time middleware
export function logApiResponse(
  req: any,
  res: any,
  next: any
): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.headers['x-user-id'];
    const requestId = req.headers['x-request-id'];
    
    apiLogger.logApiRequest(
      req.method,
      req.url,
      res.statusCode,
      duration,
      userId,
      requestId
    );
  });
  
  next();
}
