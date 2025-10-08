'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Semester {
  id: string;
  name: string;
  nameEn?: string;
  academicYearId: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface SemesterSelectorProps {
  value?: string;
  onChange: (semesterId: string) => void;
  academicYearId?: string;
  disabled?: boolean;
  lang?: 'th' | 'en';
  className?: string;
  label?: string;
  placeholder?: string;
  showActiveOnly?: boolean;
  required?: boolean;
}

export default function SemesterSelector({
  value,
  onChange,
  academicYearId,
  disabled = false,
  lang = 'th',
  className,
  label,
  placeholder,
  showActiveOnly = false,
  required = false
}: SemesterSelectorProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (academicYearId) {
      loadSemesters(academicYearId);
    } else {
      setSemesters([]);
      onChange(''); // Reset selection when no academic year
    }
  }, [academicYearId, showActiveOnly]);

  const loadSemesters = async (yearId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/semesters?academicYearId=${yearId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }
      
      const data = await response.json();
      const semestersData = Array.isArray(data) ? data : (data?.semesters || []);
      
      // Filter active semesters if needed
      const filteredSemesters = showActiveOnly 
        ? semestersData.filter((semester: Semester) => semester.isActive)
        : semestersData;
      
      // Sort by name
      const sortedSemesters = filteredSemesters.sort((a: Semester, b: Semester) => 
        a.name.localeCompare(b.name)
      );
      
      setSemesters(sortedSemesters);
    } catch (err) {
      console.error('Error loading semesters:', err);
      setError(err instanceof Error ? err.message : 'Failed to load semesters');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (semester: Semester) => {
    if (lang === 'en') {
      return semester.nameEn || semester.name;
    }
    return semester.name;
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (!academicYearId) {
      return lang === 'en' ? 'Select academic year first' : 'เลือกปีการศึกษาก่อน';
    }
    if (lang === 'en') {
      return showActiveOnly ? 'Select active semester' : 'Select semester';
    }
    return showActiveOnly ? 'เลือกภาคเรียนที่ใช้งาน' : 'เลือกภาคเรียน';
  };

  const getLabel = () => {
    if (label) return label;
    return lang === 'en' ? 'Semester' : 'ภาคเรียน';
  };

  const isDisabled = disabled || !academicYearId || isLoading || semesters.length === 0;

  if (isLoading) {
    return (
      <div className={className}>
        {label && <Label>{getLabel()}</Label>}
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Loading semesters...' : 'กำลังโหลดภาคเรียน...'}
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
          {lang === 'en' ? 'Failed to load semesters' : 'ไม่สามารถโหลดภาคเรียนได้'}
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
        disabled={isDisabled}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent>
          {!academicYearId ? (
            <SelectItem value="" disabled>
              {lang === 'en' ? 'Please select academic year first' : 'กรุณาเลือกปีการศึกษาก่อน'}
            </SelectItem>
          ) : semesters.length === 0 ? (
            <SelectItem value="" disabled>
              {lang === 'en' ? 'No semesters found' : 'ไม่พบภาคเรียน'}
            </SelectItem>
          ) : (
            semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{getDisplayName(semester)}</span>
                  {semester.isActive && (
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
