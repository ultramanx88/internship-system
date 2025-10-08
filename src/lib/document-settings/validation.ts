/**
 * Document Settings Validation Logic
 */

import { DocumentTemplate, DocumentSettingsConfig, ValidationResult, Language } from './types';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

export class DocumentSettingsValidator {
  /**
   * Validate a single document template
   */
  static validateTemplate(template: Partial<DocumentTemplate>): ValidationResult {
    const errors: string[] = [];

    // Validate prefix
    if (!template.prefix || template.prefix.trim() === '') {
      errors.push('ต้องระบุคำนำหน้า');
    } else if (template.prefix.length < VALIDATION_RULES.PREFIX.MIN_LENGTH) {
      errors.push(`คำนำหน้าต้องมีอย่างน้อย ${VALIDATION_RULES.PREFIX.MIN_LENGTH} ตัวอักษร`);
    } else if (template.prefix.length > VALIDATION_RULES.PREFIX.MAX_LENGTH) {
      errors.push(`คำนำหน้าต้องไม่เกิน ${VALIDATION_RULES.PREFIX.MAX_LENGTH} ตัวอักษร`);
    } else if (!VALIDATION_RULES.PREFIX.PATTERN.test(template.prefix)) {
      errors.push(ERROR_MESSAGES.INVALID_PREFIX);
    }

    // Validate digits
    if (template.digits === undefined || template.digits === null) {
      errors.push('ต้องระบุจำนวนหลักตัวเลข');
    } else if (template.digits < VALIDATION_RULES.DIGITS.MIN) {
      errors.push(`จำนวนหลักต้องไม่น้อยกว่า ${VALIDATION_RULES.DIGITS.MIN}`);
    } else if (template.digits > VALIDATION_RULES.DIGITS.MAX) {
      errors.push(`จำนวนหลักต้องไม่เกิน ${VALIDATION_RULES.DIGITS.MAX}`);
    }

    // Validate suffix (optional)
    if (template.suffix && template.suffix.length > VALIDATION_RULES.SUFFIX.MAX_LENGTH) {
      errors.push(`คำต่อท้ายต้องไม่เกิน ${VALIDATION_RULES.SUFFIX.MAX_LENGTH} ตัวอักษร`);
    } else if (template.suffix && !VALIDATION_RULES.SUFFIX.PATTERN.test(template.suffix)) {
      errors.push(ERROR_MESSAGES.INVALID_SUFFIX);
    }

    // Validate current number
    if (template.currentNumber === undefined || template.currentNumber === null) {
      errors.push('ต้องระบุเลขปัจจุบัน');
    } else if (template.currentNumber < VALIDATION_RULES.CURRENT_NUMBER.MIN) {
      errors.push(`เลขปัจจุบันต้องไม่น้อยกว่า ${VALIDATION_RULES.CURRENT_NUMBER.MIN}`);
    } else if (template.currentNumber > VALIDATION_RULES.CURRENT_NUMBER.MAX) {
      errors.push(`เลขปัจจุบันต้องไม่เกิน ${VALIDATION_RULES.CURRENT_NUMBER.MAX}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete document settings configuration
   */
  static validateConfig(config: DocumentSettingsConfig): ValidationResult {
    const errors: string[] = [];

    // Validate Thai template
    const thaiValidation = this.validateTemplate(config.thai);
    if (!thaiValidation.valid) {
      errors.push(...thaiValidation.errors.map(error => `ภาษาไทย: ${error}`));
    }

    // Validate English template
    const englishValidation = this.validateTemplate(config.english);
    if (!englishValidation.valid) {
      errors.push(...englishValidation.errors.map(error => `ภาษาอังกฤษ: ${error}`));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a specific field
   */
  static validateField(field: keyof DocumentTemplate, value: any): ValidationResult {
    const errors: string[] = [];

    switch (field) {
      case 'prefix':
        if (!value || value.trim() === '') {
          errors.push('ต้องระบุคำนำหน้า');
        } else if (value.length < VALIDATION_RULES.PREFIX.MIN_LENGTH) {
          errors.push(`คำนำหน้าต้องมีอย่างน้อย ${VALIDATION_RULES.PREFIX.MIN_LENGTH} ตัวอักษร`);
        } else if (value.length > VALIDATION_RULES.PREFIX.MAX_LENGTH) {
          errors.push(`คำนำหน้าต้องไม่เกิน ${VALIDATION_RULES.PREFIX.MAX_LENGTH} ตัวอักษร`);
        } else if (!VALIDATION_RULES.PREFIX.PATTERN.test(value)) {
          errors.push(ERROR_MESSAGES.INVALID_PREFIX);
        }
        break;

      case 'digits':
        const digits = parseInt(value);
        if (isNaN(digits)) {
          errors.push('จำนวนหลักต้องเป็นตัวเลข');
        } else if (digits < VALIDATION_RULES.DIGITS.MIN) {
          errors.push(`จำนวนหลักต้องไม่น้อยกว่า ${VALIDATION_RULES.DIGITS.MIN}`);
        } else if (digits > VALIDATION_RULES.DIGITS.MAX) {
          errors.push(`จำนวนหลักต้องไม่เกิน ${VALIDATION_RULES.DIGITS.MAX}`);
        }
        break;

      case 'suffix':
        if (value && value.length > VALIDATION_RULES.SUFFIX.MAX_LENGTH) {
          errors.push(`คำต่อท้ายต้องไม่เกิน ${VALIDATION_RULES.SUFFIX.MAX_LENGTH} ตัวอักษร`);
        } else if (value && !VALIDATION_RULES.SUFFIX.PATTERN.test(value)) {
          errors.push(ERROR_MESSAGES.INVALID_SUFFIX);
        }
        break;

      case 'currentNumber':
        const currentNumber = parseInt(value);
        if (isNaN(currentNumber)) {
          errors.push('เลขปัจจุบันต้องเป็นตัวเลข');
        } else if (currentNumber < VALIDATION_RULES.CURRENT_NUMBER.MIN) {
          errors.push(`เลขปัจจุบันต้องไม่น้อยกว่า ${VALIDATION_RULES.CURRENT_NUMBER.MIN}`);
        } else if (currentNumber > VALIDATION_RULES.CURRENT_NUMBER.MAX) {
          errors.push(`เลขปัจจุบันต้องไม่เกิน ${VALIDATION_RULES.CURRENT_NUMBER.MAX}`);
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input value
   */
  static sanitizeField(field: keyof DocumentTemplate, value: any): any {
    switch (field) {
      case 'prefix':
        return typeof value === 'string' ? value.trim().toUpperCase() : value;
      case 'digits':
        return typeof value === 'string' ? parseInt(value) || 1 : value;
      case 'suffix':
        return typeof value === 'string' ? value.trim().toUpperCase() : value;
      case 'currentNumber':
        return typeof value === 'string' ? parseInt(value) || 1 : value;
      default:
        return value;
    }
  }
}
