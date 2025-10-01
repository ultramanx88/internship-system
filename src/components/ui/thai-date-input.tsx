'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThaiCalendar } from '@/components/ui/thai-calendar';
import { Calendar } from 'lucide-react';
import { htmlDateToThai, thaiDateToHtml, isValidThaiDate, getDateLimits, isThaiDateInPast, parseThaiDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface ThaiDateInputProps {
  id?: string;
  label?: string;
  value?: string; // Thai format MM/DD/YYYY
  onChange?: (thaiDate: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  allowPastDates?: boolean; // Allow selecting past dates
}

export function ThaiDateInput({
  id,
  label,
  value = '',
  onChange,
  placeholder = 'วว/ดด/ปปปป',
  required = false,
  disabled = false,
  className,
  error,
  allowPastDates = false
}: ThaiDateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { min, max } = getDateLimits(allowPastDates);
  const minDate = new Date(min);
  const maxDate = new Date(max);

  // Update display value when Thai value changes
  useEffect(() => {
    if (value) {
      setDisplayValue(value);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleCalendarDateSelect = (date: Date) => {
    const thaiDate = htmlDateToThai(date.toISOString().split('T')[0]);
    setDisplayValue(thaiDate);
    onChange?.(thaiDate);
    setIsCalendarOpen(false);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove non-numeric characters except /
    inputValue = inputValue.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    if (inputValue.length <= 10) {
      // Add slashes automatically
      if (inputValue.length === 2 && !inputValue.includes('/')) {
        inputValue = inputValue + '/';
      } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
        inputValue = inputValue + '/';
      }
      
      setDisplayValue(inputValue);
      
      // Validate and convert to HTML format
      if (inputValue.length === 10 && isValidThaiDate(inputValue)) {
        // Check if date is in the past (if not allowed)
        if (!allowPastDates && isThaiDateInPast(inputValue)) {
          // Don't update, will show error on blur
          return;
        }
        
        onChange?.(inputValue);
      }
    }
  };

  const handleTextInputBlur = () => {
    setIsInputFocused(false);
    
    // Validate final input
    if (displayValue) {
      if (!isValidThaiDate(displayValue)) {
        // Reset to previous valid value or empty
        if (value) {
          setDisplayValue(value);
        } else {
          setDisplayValue('');
          onChange?.('');
        }
      } else if (!allowPastDates && isThaiDateInPast(displayValue)) {
        // Reset if past date is not allowed
        if (value && !isThaiDateInPast(value)) {
          setDisplayValue(value);
        } else {
          setDisplayValue('');
          onChange?.('');
        }
      }
    }
  };

  const getSelectedDate = () => {
    if (value) {
      return parseThaiDate(value);
    }
    return undefined;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        {/* Visible text input for Thai format */}
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleTextInputChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleTextInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-20',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          maxLength={10}
        />
        
        {/* Thai Calendar Picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <div 
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded border bg-background",
                !disabled && "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Calendar className="h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <ThaiCalendar
              selectedDate={getSelectedDate()}
              onDateSelect={handleCalendarDateSelect}
              minDate={minDate}
              maxDate={maxDate}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {!error && (
        <p className="text-xs text-muted-foreground">
          รูปแบบ: วว/ดด/ปปปป (พุทธศักราช) เช่น 03/15/2567
          {!allowPastDates && (
            <span className="block text-amber-600">
              ⚠️ ไม่สามารถเลือกวันที่ย้อนหลังได้
            </span>
          )}
        </p>
      )}
    </div>
  );
}