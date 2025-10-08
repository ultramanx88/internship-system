'use client';

import { useState } from 'react';
import AcademicYearSelector from './AcademicYearSelector';
import SemesterSelector from './SemesterSelector';

interface AcademicPeriod {
  academicYearId: string;
  semesterId: string;
}

interface AcademicPeriodSelectorProps {
  value?: AcademicPeriod;
  onChange: (period: AcademicPeriod) => void;
  disabled?: boolean;
  lang?: 'th' | 'en';
  className?: string;
  showActiveOnly?: boolean;
  required?: boolean;
  labels?: {
    academicYear?: string;
    semester?: string;
  };
  placeholders?: {
    academicYear?: string;
    semester?: string;
  };
}

export default function AcademicPeriodSelector({
  value = { academicYearId: '', semesterId: '' },
  onChange,
  disabled = false,
  lang = 'th',
  className,
  showActiveOnly = false,
  required = false,
  labels,
  placeholders
}: AcademicPeriodSelectorProps) {
  const [academicYearId, setAcademicYearId] = useState(value.academicYearId);
  const [semesterId, setSemesterId] = useState(value.semesterId);

  const handleAcademicYearChange = (newAcademicYearId: string) => {
    setAcademicYearId(newAcademicYearId);
    setSemesterId(''); // Reset semester when year changes
    onChange({
      academicYearId: newAcademicYearId,
      semesterId: ''
    });
  };

  const handleSemesterChange = (newSemesterId: string) => {
    setSemesterId(newSemesterId);
    onChange({
      academicYearId,
      semesterId: newSemesterId
    });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AcademicYearSelector
          value={academicYearId}
          onChange={handleAcademicYearChange}
          disabled={disabled}
          lang={lang}
          showActiveOnly={showActiveOnly}
          required={required}
          label={labels?.academicYear}
          placeholder={placeholders?.academicYear}
        />
        
        <SemesterSelector
          value={semesterId}
          onChange={handleSemesterChange}
          academicYearId={academicYearId}
          disabled={disabled}
          lang={lang}
          showActiveOnly={showActiveOnly}
          required={required}
          label={labels?.semester}
          placeholder={placeholders?.semester}
        />
      </div>
    </div>
  );
}
