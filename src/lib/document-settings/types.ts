/**
 * Document Settings Module Types
 */

export interface DocumentTemplate {
  prefix: string;
  digits: number;
  suffix: string;
  currentNumber: number;
}

export interface DocumentSettingsConfig {
  thai: DocumentTemplate;
  english: DocumentTemplate;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DocumentGenerationResult {
  success: boolean;
  documentNumber?: string;
  language?: 'thai' | 'english';
  nextNumber?: number;
  error?: string;
}

export interface DocumentSettingsAPIResponse {
  success: boolean;
  data?: DocumentSettingsConfig;
  message?: string;
  error?: string;
}

export type Language = 'thai' | 'english';

export interface DocumentSettingsOptions {
  autoSave?: boolean;
  validateOnChange?: boolean;
  showPreview?: boolean;
}
