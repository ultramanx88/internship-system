/**
 * Document Settings Constants
 */

import { DocumentSettingsConfig } from './types';

export const DEFAULT_DOCUMENT_TEMPLATE = {
  prefix: 'DOC',
  digits: 6,
  suffix: '',
  currentNumber: 1
};

export const DEFAULT_CONFIG: DocumentSettingsConfig = {
  thai: { ...DEFAULT_DOCUMENT_TEMPLATE },
  english: { ...DEFAULT_DOCUMENT_TEMPLATE }
};

export const VALIDATION_RULES = {
  PREFIX: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9_-]+$/
  },
  DIGITS: {
    MIN: 1,
    MAX: 10
  },
  SUFFIX: {
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9/_-]*$/
  },
  CURRENT_NUMBER: {
    MIN: 1,
    MAX: 999999999
  }
};

export const API_ENDPOINTS = {
  GET_CONFIG: '/api/document-template',
  SAVE_CONFIG: '/api/document-template',
  GENERATE_NUMBER: '/api/document-number/generate'
} as const;

export const ERROR_MESSAGES = {
  INVALID_PREFIX: 'คำนำหน้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ - เท่านั้น',
  INVALID_DIGITS: 'จำนวนหลักต้องอยู่ระหว่าง 1-10',
  INVALID_SUFFIX: 'คำต่อท้ายต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ / _ - เท่านั้น',
  INVALID_CURRENT_NUMBER: 'เลขปัจจุบันต้องอยู่ระหว่าง 1-999,999,999',
  LOAD_FAILED: 'ไม่สามารถโหลดข้อมูลการตั้งค่าได้',
  SAVE_FAILED: 'ไม่สามารถบันทึกการตั้งค่าได้',
  GENERATE_FAILED: 'ไม่สามารถสร้างเลขเอกสารได้'
} as const;
