'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toBuddhistYear, toGregorianYear } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface ThaiCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const thaiDaysShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export function ThaiCalendar({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className
}: ThaiCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate || new Date();
  });

  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());

  const buddhistViewYear = toBuddhistYear(viewYear);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(viewYear, viewMonth, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleYearChange = (increment: number) => {
    setViewYear(viewYear + increment);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  return (
    <div className={cn('p-4 bg-background border rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleYearChange(-1)}
            className="text-sm font-medium"
          >
            {buddhistViewYear}
          </Button>
          <span className="text-sm font-medium">
            {thaiMonths[viewMonth]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleYearChange(1)}
            className="text-sm font-medium"
          >
            +
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {thaiDaysShort.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <div key={index} className="h-8 flex items-center justify-center">
            {date ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                className={cn(
                  'h-8 w-8 p-0 text-xs',
                  isDateSelected(date) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  isToday(date) && !isDateSelected(date) && 'bg-accent text-accent-foreground',
                  isDateDisabled(date) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {date.getDate()}
              </Button>
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        ))}
      </div>

      {/* Today button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            setViewMonth(today.getMonth());
            setViewYear(today.getFullYear());
            if (!isDateDisabled(today)) {
              onDateSelect(today);
            }
          }}
          className="text-xs"
        >
          วันนี้
        </Button>
      </div>
    </div>
  );
}