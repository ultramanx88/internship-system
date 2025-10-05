/**
 * Document Number Generation Utilities
 */

export interface DocumentTemplate {
  prefix: string;
  digits: number;
  suffix: string;
  currentNumber: number;
}

export interface DocumentTemplateConfig {
  thai: DocumentTemplate;
  english: DocumentTemplate;
}

/**
 * Generate document number from template
 */
export function generateDocumentNumber(template: DocumentTemplate): string {
  const paddedNumber = template.currentNumber.toString().padStart(template.digits, '0');
  return `${template.prefix}${paddedNumber}${template.suffix}`;
}

/**
 * Convert Arabic numbers to Thai numbers
 */
export function convertToThaiNumbers(text: string): string {
  const arabicToThai: { [key: string]: string } = {
    '0': '๐',
    '1': '๑',
    '2': '๒',
    '3': '๓',
    '4': '๔',
    '5': '๕',
    '6': '๖',
    '7': '๗',
    '8': '๘',
    '9': '๙'
  };

  return text.replace(/[0-9]/g, (digit) => arabicToThai[digit] || digit);
}

/**
 * Generate document number with proper number format based on language
 */
export function generateLocalizedDocumentNumber(
  template: DocumentTemplate, 
  language: 'thai' | 'english'
): string {
  const documentNumber = generateDocumentNumber(template);
  
  if (language === 'thai') {
    return convertToThaiNumbers(documentNumber);
  }
  
  return documentNumber;
}

/**
 * Validate document template
 */
export function validateDocumentTemplate(template: Partial<DocumentTemplate>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.prefix || template.prefix.trim() === '') {
    errors.push('ต้องระบุคำนำหน้า (Prefix)');
  }

  if (!template.digits || template.digits < 1 || template.digits > 10) {
    errors.push('จำนวนหลักตัวเลขต้องอยู่ระหว่าง 1-10 หลัก');
  }

  if (template.currentNumber !== undefined && template.currentNumber < 1) {
    errors.push('เลขปัจจุบันต้องมากกว่า 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format document number for display
 */
export function formatDocumentNumberForDisplay(
  template: DocumentTemplate,
  language: 'thai' | 'english',
  showNext: boolean = false
): string {
  const displayTemplate = {
    ...template,
    currentNumber: showNext ? template.currentNumber + 1 : template.currentNumber
  };

  return generateLocalizedDocumentNumber(displayTemplate, language);
}
