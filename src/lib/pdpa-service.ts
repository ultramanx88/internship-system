/**
 * PDPA Compliance Service
 * Handles data protection, consent management, and anonymization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConsentData {
  userId: string;
  consentType: 'data_collection' | 'data_processing' | 'data_sharing' | 'marketing';
  isConsented: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnonymizationRule {
  tableName: string;
  columnName: string;
  anonymizationType: 'MASK' | 'HASH' | 'REMOVE' | 'PSEUDONYMIZE';
  maskPattern?: string;
}

export interface DataSubjectRequest {
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

class PDPAService {
  private static instance: PDPAService;

  private constructor() {}

  public static getInstance(): PDPAService {
    if (!PDPAService.instance) {
      PDPAService.instance = new PDPAService();
    }
    return PDPAService.instance;
  }

  /**
   * Record user consent for data processing
   */
  public async recordConsent(consentData: ConsentData): Promise<void> {
    try {
      await prisma.dataProcessingConsent.create({
        data: {
          userId: consentData.userId,
          consentType: consentData.consentType,
          isConsented: consentData.isConsented,
          ipAddress: consentData.ipAddress,
          userAgent: consentData.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw user consent
   */
  public async withdrawConsent(
    userId: string,
    consentType: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.dataProcessingConsent.updateMany({
        where: {
          userId,
          consentType,
          isConsented: true,
        },
        data: {
          isConsented: false,
          withdrawalDate: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      throw error;
    }
  }

  /**
   * Check if user has given consent for specific data processing
   */
  public async hasConsent(
    userId: string,
    consentType: string
  ): Promise<boolean> {
    try {
      const consent = await prisma.dataProcessingConsent.findFirst({
        where: {
          userId,
          consentType,
          isConsented: true,
          withdrawalDate: null,
        },
        orderBy: { consentDate: 'desc' },
      });

      return !!consent;
    } catch (error) {
      console.error('Failed to check consent:', error);
      return false;
    }
  }

  /**
   * Get all consents for a user
   */
  public async getUserConsents(userId: string) {
    try {
      return await prisma.dataProcessingConsent.findMany({
        where: { userId },
        orderBy: { consentDate: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get user consents:', error);
      return [];
    }
  }

  /**
   * Create anonymization rule
   */
  public async createAnonymizationRule(rule: AnonymizationRule): Promise<void> {
    try {
      await prisma.dataAnonymizationRule.create({
        data: {
          tableName: rule.tableName,
          columnName: rule.columnName,
          anonymizationType: rule.anonymizationType,
          maskPattern: rule.maskPattern,
        },
      });
    } catch (error) {
      console.error('Failed to create anonymization rule:', error);
      throw error;
    }
  }

  /**
   * Get all anonymization rules
   */
  public async getAnonymizationRules() {
    try {
      return await prisma.dataAnonymizationRule.findMany({
        where: { isActive: true },
        orderBy: [{ tableName: 'asc' }, { columnName: 'asc' }],
      });
    } catch (error) {
      console.error('Failed to get anonymization rules:', error);
      return [];
    }
  }

  /**
   * Anonymize data based on rules
   */
  public async anonymizeData(data: any, tableName: string): Promise<any> {
    try {
      const rules = await this.getAnonymizationRules();
      const tableRules = rules.filter(rule => rule.tableName === tableName);

      const anonymizedData = { ...data };

      for (const rule of tableRules) {
        if (anonymizedData[rule.columnName] !== undefined) {
          anonymizedData[rule.columnName] = this.applyAnonymization(
            anonymizedData[rule.columnName],
            rule.anonymizationType,
            rule.maskPattern
          );
        }
      }

      return anonymizedData;
    } catch (error) {
      console.error('Failed to anonymize data:', error);
      return data;
    }
  }

  /**
   * Apply anonymization to a specific value
   */
  private applyAnonymization(
    value: any,
    type: string,
    maskPattern?: string
  ): any {
    if (value === null || value === undefined) return value;

    switch (type) {
      case 'MASK':
        return this.maskValue(value, maskPattern);
      case 'HASH':
        return this.hashValue(value);
      case 'REMOVE':
        return null;
      case 'PSEUDONYMIZE':
        return this.pseudonymizeValue(value);
      default:
        return value;
    }
  }

  /**
   * Mask sensitive data
   */
  private maskValue(value: string, pattern?: string): string {
    if (!pattern) {
      // Default masking: show first 2 and last 2 characters
      if (value.length <= 4) return '*'.repeat(value.length);
      return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }

    // Custom pattern masking
    let masked = '';
    let valueIndex = 0;
    
    for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
      if (pattern[i] === '*') {
        masked += '*';
      } else {
        masked += value[valueIndex];
        valueIndex++;
      }
    }

    return masked;
  }

  /**
   * Hash sensitive data
   */
  private hashValue(value: string): string {
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Pseudonymize data (replace with consistent pseudonym)
   */
  private pseudonymizeValue(value: string): string {
    // Simple pseudonymization (in production, use proper pseudonymization)
    const hash = this.hashValue(value);
    return `pseudo_${hash}`;
  }

  /**
   * Get user's personal data for data portability
   */
  public async getUserData(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          applications: true,
          documents: true,
          printRecords: true,
          curriculum: true,
          department: true,
          faculty: true,
          major: true,
          dataProcessingConsents: true,
        },
      });

      if (!user) return null;

      // Anonymize sensitive data
      return await this.anonymizeData(user, 'users');
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  }

  /**
   * Delete user's personal data (right to erasure)
   */
  public async deleteUserData(userId: string): Promise<void> {
    try {
      // Check if user has active applications or other important data
      const activeApplications = await prisma.application.count({
        where: { studentId: userId, status: 'pending' },
      });

      if (activeApplications > 0) {
        throw new Error('Cannot delete user data: user has active applications');
      }

      // Delete user data
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }

  /**
   * Get consent statistics for admin dashboard
   */
  public async getConsentStatistics() {
    try {
      const totalUsers = await prisma.user.count();
      const consents = await prisma.dataProcessingConsent.groupBy({
        by: ['consentType', 'isConsented'],
        _count: { id: true },
      });

      const stats = {
        totalUsers,
        consentBreakdown: consents.reduce((acc, consent) => {
          const key = `${consent.consentType}_${consent.isConsented ? 'consented' : 'not_consented'}`;
          acc[key] = consent._count.id;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    } catch (error) {
      console.error('Failed to get consent statistics:', error);
      return { totalUsers: 0, consentBreakdown: {} };
    }
  }

  /**
   * Initialize default anonymization rules
   */
  public async initializeDefaultRules(): Promise<void> {
    try {
      const defaultRules: AnonymizationRule[] = [
        { tableName: 'users', columnName: 'password', anonymizationType: 'REMOVE' },
        { tableName: 'users', columnName: 'phone', anonymizationType: 'MASK', maskPattern: '**-***-****' },
        { tableName: 'users', columnName: 'passportId', anonymizationType: 'MASK', maskPattern: '****-****-****' },
        { tableName: 'users', columnName: 'email', anonymizationType: 'MASK', maskPattern: '***@***.***' },
        { tableName: 'companies', columnName: 'phone', anonymizationType: 'MASK', maskPattern: '**-***-****' },
        { tableName: 'companies', columnName: 'email', anonymizationType: 'MASK', maskPattern: '***@***.***' },
      ];

      for (const rule of defaultRules) {
        await this.createAnonymizationRule(rule);
      }
    } catch (error) {
      console.error('Failed to initialize default anonymization rules:', error);
    }
  }
}

// Export singleton instance
export const pdpaService = PDPAService.getInstance();
