'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AcademicYear {
  id: string;
  year: number;
  name: string;
  nameEn?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface AcademicYearSelectorProps {
  value?: string;
  onChange: (academicYearId: string) => void;
  disabled?: boolean;
  lang?: 'th' | 'en';
  className?: string;
  label?: string;
  placeholder?: string;
  showActiveOnly?: boolean;
  required?: boolean;
}

export default function AcademicYearSelector({
  value,
  onChange,
  disabled = false,
  lang = 'th',
  className,
  label,
  placeholder,
  showActiveOnly = false,
  required = false
}: AcademicYearSelectorProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAcademicYears();
  }, [showActiveOnly]);

  const loadAcademicYears = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/academic-years');
      if (!response.ok) {
        throw new Error('Failed to fetch academic years');
      }
      
      const data = await response.json();
      const years = Array.isArray(data) ? data : (data?.academicYears || []);
      
      // Filter active years if needed
      const filteredYears = showActiveOnly 
        ? years.filter((year: AcademicYear) => year.isActive)
        : years;
      
      // Sort by year descending (newest first)
      const sortedYears = filteredYears.sort((a: AcademicYear, b: AcademicYear) => b.year - a.year);
      
      setAcademicYears(sortedYears);
    } catch (err) {
      console.error('Error loading academic years:', err);
      setError(err instanceof Error ? err.message : 'Failed to load academic years');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (year: AcademicYear) => {
    if (lang === 'en') {
      return year.nameEn || year.name || `${year.year}`;
    }
    return year.name || `${year.year}`;
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (lang === 'en') {
      return showActiveOnly ? 'Select active academic year' : 'Select academic year';
    }
    return showActiveOnly ? 'เลือกปีการศึกษาที่ใช้งาน' : 'เลือกปีการศึกษา';
  };

  const getLabel = () => {
    if (label) return label;
    return lang === 'en' ? 'Academic Year' : 'ปีการศึกษา';
  };

  if (isLoading) {
    return (
      <div className={className}>
        {label && <Label>{getLabel()}</Label>}
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Loading academic years...' : 'กำลังโหลดปีการศึกษา...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {label && <Label>{getLabel()}</Label>}
        <div className="text-sm text-destructive">
          {lang === 'en' ? 'Failed to load academic years' : 'ไม่สามารถโหลดปีการศึกษาได้'}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>
        {getLabel()}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || academicYears.length === 0}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent>
          {academicYears.length === 0 ? (
            <SelectItem value="" disabled>
              {lang === 'en' ? 'No academic years found' : 'ไม่พบปีการศึกษา'}
            </SelectItem>
          ) : (
            academicYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{getDisplayName(year)}</span>
                  {year.isActive && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {lang === 'en' ? 'Active' : 'ใช้งาน'}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
