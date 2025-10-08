/**
 * Document Settings Module
 * 
 * A comprehensive module for managing document number settings and generation.
 * Provides utilities for validation, generation, and API communication.
 */

// Export types
export type {
  DocumentTemplate,
  DocumentSettingsConfig,
  ValidationResult,
  DocumentGenerationResult,
  DocumentSettingsAPIResponse,
  Language,
  DocumentSettingsOptions
} from './types';

// Export classes
export { DocumentSettingsValidator } from './validation';
export { DocumentNumberGenerator } from './generators';
export { DocumentSettingsAPI } from './api';

// Export constants
export {
  DEFAULT_DOCUMENT_TEMPLATE,
  DEFAULT_CONFIG,
  VALIDATION_RULES,
  API_ENDPOINTS,
  ERROR_MESSAGES
} from './constants';

// Export utility functions
export * from './utils';

// Re-export from existing document-number module for backward compatibility
export {
  generateDocumentNumber,
  convertToThaiNumbers,
  generateLocalizedDocumentNumber,
  validateDocumentTemplate,
  formatDocumentNumberForDisplay
} from '../document-number';
