/**
 * Document Number Generation Logic
 */

import { DocumentTemplate, Language } from './types';

export class DocumentNumberGenerator {
  /**
   * Generate document number from template
   */
  static generateDocumentNumber(template: DocumentTemplate): string {
    const paddedNumber = template.currentNumber.toString().padStart(template.digits, '0');
    return `${template.prefix}${paddedNumber}${template.suffix}`;
  }

  /**
   * Convert Arabic numbers to Thai numbers
   */
  static convertToThaiNumbers(text: string): string {
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
  static generateLocalizedDocumentNumber(
    template: DocumentTemplate, 
    language: Language
  ): string {
    const documentNumber = this.generateDocumentNumber(template);
    
    if (language === 'thai') {
      return this.convertToThaiNumbers(documentNumber);
    }
    
    return documentNumber;
  }

  /**
   * Generate preview of current document number
   */
  static generatePreview(template: DocumentTemplate, language: Language): string {
    return this.generateLocalizedDocumentNumber(template, language);
  }

  /**
   * Generate preview of next document number
   */
  static generateNextPreview(template: DocumentTemplate, language: Language): string {
    const nextTemplate = {
      ...template,
      currentNumber: template.currentNumber + 1
    };
    return this.generateLocalizedDocumentNumber(nextTemplate, language);
  }

  /**
   * Format document number for display
   */
  static formatForDisplay(
    template: DocumentTemplate,
    language: Language,
    showNext: boolean = false
  ): string {
    const displayTemplate = {
      ...template,
      currentNumber: showNext ? template.currentNumber + 1 : template.currentNumber
    };

    return this.generateLocalizedDocumentNumber(displayTemplate, language);
  }

  /**
   * Generate multiple document numbers
   */
  static generateMultiple(
    template: DocumentTemplate,
    language: Language,
    count: number
  ): string[] {
    const numbers: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const tempTemplate = {
        ...template,
        currentNumber: template.currentNumber + i
      };
      numbers.push(this.generateLocalizedDocumentNumber(tempTemplate, language));
    }
    
    return numbers;
  }

  /**
   * Extract number from document number string
   */
  static extractNumber(documentNumber: string, template: DocumentTemplate): number | null {
    const prefix = template.prefix;
    const suffix = template.suffix;
    
    // Remove prefix and suffix
    let numberPart = documentNumber;
    if (documentNumber.startsWith(prefix)) {
      numberPart = documentNumber.substring(prefix.length);
    }
    if (suffix && numberPart.endsWith(suffix)) {
      numberPart = numberPart.substring(0, numberPart.length - suffix.length);
    }
    
    // Convert Thai numbers to Arabic if needed
    const arabicNumber = this.convertThaiToArabic(numberPart);
    const number = parseInt(arabicNumber);
    
    return isNaN(number) ? null : number;
  }

  /**
   * Convert Thai numbers to Arabic numbers
   */
  private static convertThaiToArabic(text: string): string {
    const thaiToArabic: { [key: string]: string } = {
      '๐': '0',
      '๑': '1',
      '๒': '2',
      '๓': '3',
      '๔': '4',
      '๕': '5',
      '๖': '6',
      '๗': '7',
      '๘': '8',
      '๙': '9'
    };

    return text.replace(/[๐-๙]/g, (digit) => thaiToArabic[digit] || digit);
  }
}
