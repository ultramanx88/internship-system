/**
 * Document Settings API Layer
 */

import { 
  DocumentSettingsConfig, 
  DocumentGenerationResult, 
  DocumentSettingsAPIResponse,
  Language 
} from './types';
import { API_ENDPOINTS, ERROR_MESSAGES } from './constants';

export class DocumentSettingsAPI {
  /**
   * Load document settings configuration
   */
  static async loadConfig(): Promise<DocumentSettingsConfig> {
    try {
      const response = await fetch(API_ENDPOINTS.GET_CONFIG);
      let data: DocumentSettingsAPIResponse | null = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      const currentYear = new Date().getFullYear();
      const fallback: DocumentSettingsConfig = {
        thai: { 
          prefix: 'มทร', 
          digits: 6, 
          suffix: `/${currentYear + 543}`, // พ.ศ.
          currentNumber: 1 
        },
        english: { 
          prefix: 'DOC', 
          digits: 6, 
          suffix: `/${currentYear}`, // ค.ศ.
          currentNumber: 1 
        }
      };

      if (!response.ok) {
        let errorMessage = `${ERROR_MESSAGES.LOAD_FAILED} (${response.status})`;
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          }
        }
        console.warn('Document settings load failed, using fallback:', errorMessage);
        return fallback;
      }

      if (!data || !data.success || !data.data) {
        // Return safe defaults instead of throwing to keep UI functional
        return fallback;
      }

      return data.data;
    } catch (error) {
      console.error('Error loading document settings:', error);
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.LOAD_FAILED);
    }
  }

  /**
   * Save document settings configuration
   */
  static async saveConfig(config: DocumentSettingsConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(API_ENDPOINTS.SAVE_CONFIG, {
        method: 'PUT',
        headers,
        body: JSON.stringify(config as any),
      });

      let data: DocumentSettingsAPIResponse | null = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok || !data?.success) {
        const errorMessage = (data && ((data as any).error || (data as any).message)) || ERROR_MESSAGES.SAVE_FAILED;
        console.warn('Document settings save failed:', errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving document settings:', error);
      return { success: false, error: error instanceof Error ? error.message : ERROR_MESSAGES.SAVE_FAILED };
    }
  }

  /**
   * Generate a new document number
   */
  static async generateDocumentNumber(language: Language = 'thai'): Promise<DocumentGenerationResult> {
    try {
      const response = await fetch(API_ENDPOINTS.GENERATE_NUMBER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.message || data.error || ERROR_MESSAGES.GENERATE_FAILED
        };
      }

      return {
        success: true,
        documentNumber: data.data.documentNumber,
        language: data.data.language,
        nextNumber: data.data.nextNumber
      };
    } catch (error) {
      console.error('Error generating document number:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATE_FAILED
      };
    }
  }

  /**
   * Test API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.GET_CONFIG);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API status
   */
  static async getStatus(): Promise<{
    config: boolean;
    generate: boolean;
    overall: boolean;
  }> {
    const configStatus = await this.testConnection();
    
    let generateStatus = false;
    try {
      const response = await fetch(API_ENDPOINTS.GENERATE_NUMBER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'thai' })
      });
      generateStatus = response.ok;
    } catch (error) {
      generateStatus = false;
    }

    return {
      config: configStatus,
      generate: generateStatus,
      overall: configStatus && generateStatus
    };
  }
}
