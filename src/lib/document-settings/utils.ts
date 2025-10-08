/**
 * Document Settings Utility Functions
 */

import { DocumentTemplate, DocumentSettingsConfig, Language } from './types';
import { DocumentNumberGenerator } from './generators';

/**
 * Create a new document template with default values
 */
export function createDocumentTemplate(overrides: Partial<DocumentTemplate> = {}): DocumentTemplate {
  return {
    prefix: 'DOC',
    digits: 6,
    suffix: '',
    currentNumber: 1,
    ...overrides
  };
}

/**
 * Create a new document settings configuration
 */
export function createDocumentSettingsConfig(overrides: Partial<DocumentSettingsConfig> = {}): DocumentSettingsConfig {
  return {
    thai: createDocumentTemplate(overrides.thai),
    english: createDocumentTemplate(overrides.english),
    ...overrides
  };
}

/**
 * Clone a document template
 */
export function cloneDocumentTemplate(template: DocumentTemplate): DocumentTemplate {
  return { ...template };
}

/**
 * Clone a document settings configuration
 */
export function cloneDocumentSettingsConfig(config: DocumentSettingsConfig): DocumentSettingsConfig {
  return {
    thai: cloneDocumentTemplate(config.thai),
    english: cloneDocumentTemplate(config.english)
  };
}

/**
 * Update a specific field in a document template
 */
export function updateDocumentTemplateField(
  template: DocumentTemplate,
  field: keyof DocumentTemplate,
  value: any
): DocumentTemplate {
  return {
    ...template,
    [field]: value
  };
}

/**
 * Update a specific field in a document settings configuration
 */
export function updateDocumentSettingsField(
  config: DocumentSettingsConfig,
  language: Language,
  field: keyof DocumentTemplate,
  value: any
): DocumentSettingsConfig {
  return {
    ...config,
    [language]: updateDocumentTemplateField(config[language], field, value)
  };
}

/**
 * Reset document template to default values
 */
export function resetDocumentTemplate(template: DocumentTemplate): DocumentTemplate {
  return createDocumentTemplate();
}

/**
 * Reset document settings configuration to default values
 */
export function resetDocumentSettingsConfig(config: DocumentSettingsConfig): DocumentSettingsConfig {
  return createDocumentSettingsConfig();
}

/**
 * Check if two document templates are equal
 */
export function areDocumentTemplatesEqual(template1: DocumentTemplate, template2: DocumentTemplate): boolean {
  return (
    template1.prefix === template2.prefix &&
    template1.digits === template2.digits &&
    template1.suffix === template2.suffix &&
    template1.currentNumber === template2.currentNumber
  );
}

/**
 * Check if two document settings configurations are equal
 */
export function areDocumentSettingsConfigsEqual(
  config1: DocumentSettingsConfig,
  config2: DocumentSettingsConfig
): boolean {
  return (
    areDocumentTemplatesEqual(config1.thai, config2.thai) &&
    areDocumentTemplatesEqual(config1.english, config2.english)
  );
}

/**
 * Get preview of document numbers for both languages
 */
export function getDocumentNumberPreviews(config: DocumentSettingsConfig): {
  thai: {
    current: string;
    next: string;
  };
  english: {
    current: string;
    next: string;
  };
} {
  return {
    thai: {
      current: DocumentNumberGenerator.generatePreview(config.thai, 'thai'),
      next: DocumentNumberGenerator.generateNextPreview(config.thai, 'thai')
    },
    english: {
      current: DocumentNumberGenerator.generatePreview(config.english, 'english'),
      next: DocumentNumberGenerator.generateNextPreview(config.english, 'english')
    }
  };
}

/**
 * Format document template for display
 */
export function formatDocumentTemplateForDisplay(template: DocumentTemplate, language: Language): string {
  return DocumentNumberGenerator.generateLocalizedDocumentNumber(template, language);
}

/**
 * Parse document number string to extract components
 */
export function parseDocumentNumber(
  documentNumber: string,
  template: DocumentTemplate
): {
  prefix: string;
  number: string;
  suffix: string;
  numericValue: number | null;
} {
  const prefix = template.prefix;
  const suffix = template.suffix;
  
  let numberPart = documentNumber;
  
  // Extract prefix
  if (documentNumber.startsWith(prefix)) {
    numberPart = documentNumber.substring(prefix.length);
  }
  
  // Extract suffix
  if (suffix && numberPart.endsWith(suffix)) {
    numberPart = numberPart.substring(0, numberPart.length - suffix.length);
  }
  
  // Convert Thai numbers to Arabic
  const arabicNumber = numberPart.replace(/[๐-๙]/g, (digit) => {
    const thaiToArabic: { [key: string]: string } = {
      '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
      '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
    };
    return thaiToArabic[digit] || digit;
  });
  
  const numericValue = parseInt(arabicNumber);
  
  return {
    prefix,
    number: numberPart,
    suffix,
    numericValue: isNaN(numericValue) ? null : numericValue
  };
}

/**
 * Generate a range of document numbers
 */
export function generateDocumentNumberRange(
  template: DocumentTemplate,
  language: Language,
  start: number,
  count: number
): string[] {
  const numbers: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const tempTemplate = {
      ...template,
      currentNumber: start + i
    };
    numbers.push(DocumentNumberGenerator.generateLocalizedDocumentNumber(tempTemplate, language));
  }
  
  return numbers;
}
