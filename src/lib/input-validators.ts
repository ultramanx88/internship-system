/**
 * Input Validators and Filters
 * โมดูลสำหรับตรวจสอบและกรองข้อมูลที่ป้อนเข้า
 */

// Regular expressions for different input types
export const INPUT_PATTERNS = {
  // ภาษาไทย: อักขระไทย, วรรณยุกต์, เลขไทย, ช่องว่าง
  THAI_ONLY: /^[\u0E00-\u0E7F\s]*$/,
  
  // ภาษาอังกฤษ: A-Z, a-z, ช่องว่าง, จุด, ขีด, อัญประกาศ
  ENGLISH_ONLY: /^[A-Za-z\s.\-']*$/,
  
  // ตัวเลขเท่านั้น
  NUMBERS_ONLY: /^[0-9]*$/,
  
  // อักขระพิเศษที่อนุญาตในชื่อ
  NAME_SPECIAL_CHARS: /^[A-Za-z\u0E00-\u0E7F\s.\-']*$/,
} as const;

// Input types for validation
export type InputType = 'thai' | 'english' | 'numbers' | 'mixed';

/**
 * ตรวจสอบว่าข้อความตรงตามรูปแบบที่กำหนดหรือไม่
 */
export function validateInput(value: string, type: InputType): boolean {
  if (!value) return true; // Empty values are allowed
  
  switch (type) {
    case 'thai':
      return INPUT_PATTERNS.THAI_ONLY.test(value);
    case 'english':
      return INPUT_PATTERNS.ENGLISH_ONLY.test(value);
    case 'numbers':
      return INPUT_PATTERNS.NUMBERS_ONLY.test(value);
    case 'mixed':
      return INPUT_PATTERNS.NAME_SPECIAL_CHARS.test(value);
    default:
      return true;
  }
}

/**
 * กรองอักขระที่ไม่ต้องการออกจากข้อความ
 */
export function filterInput(value: string, type: InputType): string {
  if (!value) return '';
  
  switch (type) {
    case 'thai':
      // เก็บเฉพาะอักขระไทยและช่องว่าง
      return value.replace(/[^\u0E00-\u0E7F\s]/g, '');
    
    case 'english':
      // เก็บเฉพาะอักขระอังกฤษ ช่องว่าง จุด ขีด อัญประกาศ
      return value.replace(/[^A-Za-z\s.\-']/g, '');
    
    case 'numbers':
      // เก็บเฉพาะตัวเลข
      return value.replace(/[^0-9]/g, '');
    
    case 'mixed':
      // เก็บอักขระที่อนุญาตในชื่อ
      return value.replace(/[^A-Za-z\u0E00-\u0E7F\s.\-']/g, '');
    
    default:
      return value;
  }
}

/**
 * ตรวจสอบว่าข้อความมีตัวเลขหรือไม่
 */
export function hasNumbers(value: string): boolean {
  return /\d/.test(value);
}

/**
 * ตรวจสอบว่าข้อความเป็นภาษาไทยหรือไม่
 */
export function isThaiText(value: string): boolean {
  if (!value.trim()) return false;
  return /[\u0E00-\u0E7F]/.test(value);
}

/**
 * ตรวจสอบว่าข้อความเป็นภาษาอังกฤษหรือไม่
 */
export function isEnglishText(value: string): boolean {
  if (!value.trim()) return false;
  return /[A-Za-z]/.test(value) && !/[\u0E00-\u0E7F]/.test(value);
}

/**
 * ข้อความแสดงข้อผิดพลาดสำหรับแต่ละประเภท
 */
export const ERROR_MESSAGES = {
  THAI_ONLY: 'กรุณากรอกเฉพาะอักขระภาษาไทยเท่านั้น',
  ENGLISH_ONLY: 'กรุณากรอกเฉพาะอักขระภาษาอังกฤษเท่านั้น',
  NO_NUMBERS: 'ไม่สามารถกรอกตัวเลขได้',
  NUMBERS_ONLY: 'กรุณากรอกเฉพาะตัวเลขเท่านั้น',
  INVALID_CHARACTERS: 'มีอักขระที่ไม่อนุญาตในข้อความ',
} as const;

/**
 * Hook สำหรับจัดการ input validation
 */
export function createInputHandler(
  type: InputType,
  onChange: (value: string) => void,
  onError?: (error: string | null) => void
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const filteredValue = filterInput(rawValue, type);
    
    // ตรวจสอบว่ามีการกรองอักขระออกหรือไม่
    if (rawValue !== filteredValue && onError) {
      switch (type) {
        case 'thai':
          onError(ERROR_MESSAGES.THAI_ONLY);
          break;
        case 'english':
          onError(ERROR_MESSAGES.ENGLISH_ONLY);
          break;
        case 'numbers':
          onError(ERROR_MESSAGES.NUMBERS_ONLY);
          break;
        default:
          onError(ERROR_MESSAGES.INVALID_CHARACTERS);
      }
    } else if (onError) {
      onError(null);
    }
    
    // ตรวจสอบเพิ่มเติมสำหรับชื่อที่ไม่ควรมีตัวเลข
    if ((type === 'thai' || type === 'english') && hasNumbers(filteredValue) && onError) {
      onError(ERROR_MESSAGES.NO_NUMBERS);
      return;
    }
    
    onChange(filteredValue);
  };
}

/**
 * Validation rules สำหรับฟอร์ม
 */
export const VALIDATION_RULES = {
  THAI_NAME: {
    type: 'thai' as InputType,
    required: false,
    minLength: 1,
    maxLength: 50,
    pattern: INPUT_PATTERNS.THAI_ONLY,
    errorMessage: ERROR_MESSAGES.THAI_ONLY,
  },
  ENGLISH_NAME: {
    type: 'english' as InputType,
    required: false,
    minLength: 1,
    maxLength: 50,
    pattern: INPUT_PATTERNS.ENGLISH_ONLY,
    errorMessage: ERROR_MESSAGES.ENGLISH_ONLY,
  },
  STUDENT_ID: {
    type: 'numbers' as InputType,
    required: true,
    minLength: 8,
    maxLength: 12,
    pattern: INPUT_PATTERNS.NUMBERS_ONLY,
    errorMessage: ERROR_MESSAGES.NUMBERS_ONLY,
  },
} as const;

/**
 * ตรวจสอบความถูกต้องของข้อมูลตาม validation rules
 */
export function validateField(
  value: string,
  rules: typeof VALIDATION_RULES[keyof typeof VALIDATION_RULES]
): { isValid: boolean; error: string | null } {
  // ตรวจสอบ required
  if (rules.required && !value.trim()) {
    return { isValid: false, error: 'ข้อมูลนี้จำเป็นต้องกรอก' };
  }
  
  // ถ้าไม่มีค่าและไม่ required ก็ผ่าน
  if (!value.trim() && !rules.required) {
    return { isValid: true, error: null };
  }
  
  // ตรวจสอบ pattern
  if (!rules.pattern.test(value)) {
    return { isValid: false, error: rules.errorMessage };
  }
  
  // ตรวจสอบความยาว
  if (value.length < rules.minLength) {
    return { isValid: false, error: `ต้องมีอย่างน้อย ${rules.minLength} ตัวอักษร` };
  }
  
  if (value.length > rules.maxLength) {
    return { isValid: false, error: `ไม่เกิน ${rules.maxLength} ตัวอักษร` };
  }
  
  // ตรวจสอบตัวเลขในชื่อ
  if ((rules.type === 'thai' || rules.type === 'english') && hasNumbers(value)) {
    return { isValid: false, error: ERROR_MESSAGES.NO_NUMBERS };
  }
  
  return { isValid: true, error: null };
}