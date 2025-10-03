import { useState, useCallback } from 'react';
import { 
  InputType, 
  validateField, 
  createInputHandler, 
  VALIDATION_RULES,
  filterInput 
} from '@/lib/input-validators';

interface UseInputValidationOptions {
  type: InputType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  initialValue?: string;
  onValidationChange?: (isValid: boolean) => void;
}

interface UseInputValidationReturn {
  value: string;
  error: string | null;
  isValid: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  setValue: (value: string) => void;
  clearError: () => void;
  validate: () => boolean;
}

/**
 * Hook สำหรับจัดการ input validation
 */
export function useInputValidation(options: UseInputValidationOptions): UseInputValidationReturn {
  const [value, setValue] = useState(options.initialValue || '');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // สร้าง validation rules
  const rules = {
    type: options.type,
    required: options.required || false,
    minLength: options.minLength || 1,
    maxLength: options.maxLength || 100,
    pattern: options.type === 'thai' ? VALIDATION_RULES.THAI_NAME.pattern :
             options.type === 'english' ? VALIDATION_RULES.ENGLISH_NAME.pattern :
             options.type === 'numbers' ? VALIDATION_RULES.STUDENT_ID.pattern :
             VALIDATION_RULES.THAI_NAME.pattern,
    errorMessage: options.type === 'thai' ? VALIDATION_RULES.THAI_NAME.errorMessage :
                  options.type === 'english' ? VALIDATION_RULES.ENGLISH_NAME.errorMessage :
                  options.type === 'numbers' ? VALIDATION_RULES.STUDENT_ID.errorMessage :
                  'ข้อมูลไม่ถูกต้อง'
  } as any;

  // ตรวจสอบความถูกต้อง
  const validate = useCallback(() => {
    const result = validateField(value, rules);
    setError(result.error);
    
    if (options.onValidationChange) {
      options.onValidationChange(result.isValid);
    }
    
    return result.isValid;
  }, [value, rules, options]);

  // จัดการการเปลี่ยนแปลงค่า
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const filteredValue = filterInput(rawValue, options.type);
    
    setValue(filteredValue);
    
    // ถ้าเคยถูกแตะแล้ว ให้ validate ทันที
    if (touched) {
      setTimeout(() => {
        const result = validateField(filteredValue, rules);
        setError(result.error);
        
        if (options.onValidationChange) {
          options.onValidationChange(result.isValid);
        }
      }, 0);
    }
  }, [options.type, touched, rules, options]);

  // จัดการเมื่อ blur (เสร็จสิ้นการแก้ไข)
  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  // ตั้งค่าใหม่
  const setValueDirectly = useCallback((newValue: string) => {
    const filteredValue = filterInput(newValue, options.type);
    setValue(filteredValue);
    
    if (touched) {
      setTimeout(() => {
        const result = validateField(filteredValue, rules);
        setError(result.error);
        
        if (options.onValidationChange) {
          options.onValidationChange(result.isValid);
        }
      }, 0);
    }
  }, [options.type, touched, rules, options]);

  // ล้างข้อผิดพลาด
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isValid = error === null && (value.trim() !== '' || !rules.required);

  return {
    value,
    error,
    isValid,
    handleChange,
    handleBlur,
    setValue: setValueDirectly,
    clearError,
    validate
  };
}

/**
 * Hook สำหรับจัดการ validation หลายฟิลด์
 */
export function useMultipleInputValidation(fields: Record<string, UseInputValidationOptions>) {
  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({});
  
  const inputs = Object.keys(fields).reduce((acc, key) => {
    acc[key] = useInputValidation({
      ...fields[key],
      onValidationChange: (isValid) => {
        setValidationStates(prev => ({
          ...prev,
          [key]: isValid
        }));
        fields[key].onValidationChange?.(isValid);
      }
    });
    return acc;
  }, {} as Record<string, UseInputValidationReturn>);

  const isAllValid = Object.values(validationStates).every(Boolean) && 
                     Object.values(inputs).every(input => input.isValid);

  const validateAll = () => {
    return Object.values(inputs).every(input => input.validate());
  };

  const clearAllErrors = () => {
    Object.values(inputs).forEach(input => input.clearError());
  };

  return {
    inputs,
    isAllValid,
    validateAll,
    clearAllErrors,
    validationStates
  };
}