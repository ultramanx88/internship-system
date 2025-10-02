import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInputValidation } from '@/hooks/use-input-validation';
import { InputType } from '@/lib/input-validators';
import { cn } from '@/lib/utils';

interface ValidatedInputProps {
  label: string;
  type: InputType;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  disabled?: boolean;
  helperText?: string;
}

/**
 * Input Component ที่มี validation built-in
 */
export function ValidatedInput({
  label,
  type,
  placeholder,
  required = false,
  minLength,
  maxLength,
  value: externalValue,
  onChange: externalOnChange,
  onValidationChange,
  className,
  disabled = false,
  helperText,
  ...props
}: ValidatedInputProps) {
  const {
    value,
    error,
    isValid,
    handleChange,
    handleBlur,
    setValue
  } = useInputValidation({
    type,
    required,
    minLength,
    maxLength,
    initialValue: externalValue || '',
    onValidationChange
  });

  // Sync with external value
  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== value) {
      setValue(externalValue);
    }
  }, [externalValue, value, setValue]);

  // Notify parent of changes
  React.useEffect(() => {
    if (externalOnChange && value !== externalValue) {
      externalOnChange(value);
    }
  }, [value, externalOnChange, externalValue]);

  const getInputTypeHint = () => {
    switch (type) {
      case 'thai':
        return 'เฉพาะอักขระภาษาไทย';
      case 'english':
        return 'เฉพาะอักขระภาษาอังกฤษ';
      case 'numbers':
        return 'เฉพาะตัวเลข';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'text-base',
          error && 'border-red-500 focus:border-red-500',
          isValid && value && 'border-green-500',
          className
        )}
        {...props}
      />
      
      {/* Helper text or error message */}
      <div className="min-h-[1.25rem]">
        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : (
          <p className="text-xs text-gray-400">{getInputTypeHint()}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Props สำหรับ Name Input Group
 */
interface NameInputGroupProps {
  language: 'thai' | 'english';
  values: {
    prefix: string;
    name: string;
    middleName: string;
    surname: string;
  };
  onChange: (field: string, value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  prefixOptions: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Component สำหรับกลุ่ม Input ชื่อ-นามสกุล
 */
export function NameInputGroup({
  language,
  values,
  onChange,
  onValidationChange,
  prefixOptions,
  required = false,
  disabled = false
}: NameInputGroupProps) {
  const [validationStates, setValidationStates] = React.useState({
    name: false,
    middleName: true, // ชื่อกลางไม่บังคับ
    surname: false
  });

  const handleValidationChange = (field: string, isValid: boolean) => {
    setValidationStates(prev => {
      const newStates = { ...prev, [field]: isValid };
      const allValid = Object.values(newStates).every(Boolean);
      onValidationChange?.(allValid);
      return newStates;
    });
  };

  const isThaiLanguage = language === 'thai';
  const inputType: InputType = isThaiLanguage ? 'thai' : 'english';
  
  const labels = {
    prefix: isThaiLanguage ? 'คำนำหน้า' : 'Prefix',
    name: isThaiLanguage ? 'ชื่อ' : 'First Name',
    middleName: isThaiLanguage ? 'ชื่อกลาง' : 'Middle Name',
    surname: isThaiLanguage ? 'นามสกุล' : 'Last Name'
  };

  const placeholders = {
    name: isThaiLanguage ? 'ชื่อ' : 'First Name',
    middleName: isThaiLanguage ? 'ชื่อกลาง (ถ้ามี)' : 'Middle Name (optional)',
    surname: isThaiLanguage ? 'นามสกุล' : 'Last Name'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Prefix Dropdown */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-2 block">
          {labels.prefix}
        </Label>
        <select
          value={values.prefix}
          onChange={(e) => onChange('prefix', e.target.value)}
          disabled={disabled}
          className="w-full text-base border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">เลือก{labels.prefix}</option>
          {prefixOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <ValidatedInput
        label={labels.name}
        type={inputType}
        placeholder={placeholders.name}
        required={required}
        value={values.name}
        onChange={(value) => onChange('name', value)}
        onValidationChange={(isValid) => handleValidationChange('name', isValid)}
        disabled={disabled}
        minLength={1}
        maxLength={50}
      />

      {/* Middle Name */}
      <ValidatedInput
        label={labels.middleName}
        type={inputType}
        placeholder={placeholders.middleName}
        required={false}
        value={values.middleName}
        onChange={(value) => onChange('middleName', value)}
        onValidationChange={(isValid) => handleValidationChange('middleName', isValid)}
        disabled={disabled}
        maxLength={50}
      />

      {/* Surname */}
      <ValidatedInput
        label={labels.surname}
        type={inputType}
        placeholder={placeholders.surname}
        required={required}
        value={values.surname}
        onChange={(value) => onChange('surname', value)}
        onValidationChange={(isValid) => handleValidationChange('surname', isValid)}
        disabled={disabled}
        minLength={1}
        maxLength={50}
      />
    </div>
  );
}