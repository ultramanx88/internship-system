/**
 * Enhanced logging system with database integration and 90-day retention
 */

import { PrismaClient, LogLevel, SystemLog, AuditLog } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export enum LogLevelEnum {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

interface AuditContext {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

class EnhancedLogger {
  private static instance: EnhancedLogger;
  private retentionDays: number = 90;

  private constructor() {
    this.initializeRetentionPolicies();
  }

  public static getInstance(): EnhancedLogger {
    if (!EnhancedLogger.instance) {
      EnhancedLogger.instance = new EnhancedLogger();
    }
    return EnhancedLogger.instance;
  }

  private async initializeRetentionPolicies() {
    try {
      // Initialize default retention policies
      const policies = [
        { logType: 'system_logs', retentionDays: 90 },
        { logType: 'audit_logs', retentionDays: 90 },
        { logType: 'error_logs', retentionDays: 90 },
      ];

      for (const policy of policies) {
        await prisma.logRetentionPolicy.upsert({
          where: { logType: policy.logType },
          update: {},
          create: policy,
        });
      }
    } catch (error) {
      console.error('Failed to initialize retention policies:', error);
    }
  }

  private async shouldLog(level: LogLevelEnum): Promise<boolean> {
    // In production, only log WARN and ERROR by default
    if (process.env.NODE_ENV === 'production') {
      return level === LogLevelEnum.WARN || level === LogLevelEnum.ERROR;
    }
    return true;
  }

  private async logToDatabase(
    level: LogLevelEnum,
    message: string,
    context?: LogContext
  ): Promise<void> {
    try {
      if (!(await this.shouldLog(level))) return;

      await prisma.systemLog.create({
        data: {
          level: level as LogLevel,
          message,
          context: context ? JSON.stringify(context) : null,
          userId: context?.userId,
          sessionId: context?.sessionId,
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          endpoint: context?.endpoint,
          method: context?.method,
          statusCode: context?.statusCode,
          duration: context?.duration,
        },
      });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  private async auditToDatabase(context: AuditContext): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: context.action,
          entityType: context.entityType,
          entityId: context.entityId,
          oldValues: context.oldValues ? JSON.stringify(context.oldValues) : null,
          newValues: context.newValues ? JSON.stringify(context.newValues) : null,
          reason: context.reason,
          userId: context.userId,
          sessionId: context.sessionId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to audit to database:', error);
    }
  }

  private formatMessage(level: LogLevelEnum, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private logToConsole(level: LogLevelEnum, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case LogLevelEnum.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevelEnum.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevelEnum.INFO:
        console.info(formattedMessage);
        break;
      case LogLevelEnum.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  public async log(
    level: LogLevelEnum,
    message: string,
    context?: LogContext
  ): Promise<void> {
    // Log to console
    this.logToConsole(level, message, context);
    
    // Log to database
    await this.logToDatabase(level, message, context);
  }

  public async error(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevelEnum.ERROR, message, context);
  }

  public async warn(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevelEnum.WARN, message, context);
  }

  public async info(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevelEnum.INFO, message, context);
  }

  public async debug(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevelEnum.DEBUG, message, context);
  }

  public async audit(context: AuditContext): Promise<void> {
    await this.auditToDatabase(context);
  }

  public async logUserAction(
    action: string,
    userId: string,
    context?: LogContext
  ): Promise<void> {
    await this.info(`User action: ${action}`, {
      ...context,
      userId,
    });
  }

  public async logError(error: Error, context?: LogContext): Promise<void> {
    await this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  public async logApiRequest(
    request: NextRequest,
    response: Response,
    duration: number,
    userId?: string
  ): Promise<void> {
    const context: LogContext = {
      userId,
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      duration,
    };

    const level = response.status >= 400 ? LogLevelEnum.ERROR : 
                  response.status >= 300 ? LogLevelEnum.WARN : LogLevelEnum.INFO;

    await this.log(level, `API ${request.method} ${request.nextUrl.pathname}`, context);
  }

  public async cleanupOldLogs(): Promise<void> {
    try {
      const policies = await prisma.logRetentionPolicy.findMany({
        where: { isActive: true },
      });

      for (const policy of policies) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

        let deletedCount = 0;

        if (policy.logType === 'system_logs') {
          const result = await prisma.systemLog.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          });
          deletedCount = result.count;
        } else if (policy.logType === 'audit_logs') {
          const result = await prisma.auditLog.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          });
          deletedCount = result.count;
        }

        // Update last cleanup time
        await prisma.logRetentionPolicy.update({
          where: { id: policy.id },
          data: { lastCleanup: new Date() },
        });

        console.log(`Cleaned up ${deletedCount} ${policy.logType} older than ${policy.retentionDays} days`);
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  public async getLogs(
    logType: 'system' | 'audit' = 'system',
    filters?: {
      level?: LogLevelEnum;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: any[]; total: number }> {
    try {
      const where: any = {};

      if (filters?.level) {
        where.level = filters.level;
      }
      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      if (logType === 'system') {
        const [logs, total] = await Promise.all([
          prisma.systemLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: { user: { select: { id: true, name: true, email: true } } },
          }),
          prisma.systemLog.count({ where }),
        ]);

        return { logs, total };
      } else {
        const [logs, total] = await Promise.all([
          prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: { user: { select: { id: true, name: true, email: true } } },
          }),
          prisma.auditLog.count({ where }),
        ]);

        return { logs, total };
      }
    } catch (error) {
      console.error('Failed to get logs:', error);
      return { logs: [], total: 0 };
    }
  }

  public async updateRetentionPolicy(
    logType: string,
    retentionDays: number
  ): Promise<void> {
    try {
      await prisma.logRetentionPolicy.upsert({
        where: { logType },
        update: { retentionDays, updatedAt: new Date() },
        create: { logType, retentionDays },
      });
    } catch (error) {
      console.error('Failed to update retention policy:', error);
    }
  }
}

// Export singleton instance
export const enhancedLogger = EnhancedLogger.getInstance();

// Export convenience functions
export const logError = (message: string, context?: LogContext) => 
  enhancedLogger.error(message, context);

export const logWarn = (message: string, context?: LogContext) => 
  enhancedLogger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  enhancedLogger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  enhancedLogger.debug(message, context);

export const logAudit = (context: AuditContext) => 
  enhancedLogger.audit(context);

export const logUserAction = (action: string, userId: string, context?: LogContext) => 
  enhancedLogger.logUserAction(action, userId, context);

export const logApiRequest = (request: NextRequest, response: Response, duration: number, userId?: string) => 
  enhancedLogger.logApiRequest(request, response, duration, userId);
