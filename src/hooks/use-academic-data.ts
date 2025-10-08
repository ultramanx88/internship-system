'use client';

import { useState, useEffect } from 'react';

interface AcademicYear {
  id: string;
  year: number;
  name: string;
  nameEn?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Semester {
  id: string;
  name: string;
  nameEn?: string;
  academicYearId: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAcademicDataReturn {
  academicYears: AcademicYear[];
  semesters: Semester[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getActiveAcademicYear: () => AcademicYear | null;
  getActiveSemester: (academicYearId?: string) => Semester | null;
  getSemestersByYear: (academicYearId: string) => Semester[];
}

export function useAcademicData(): UseAcademicDataReturn {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [yearsResponse, semestersResponse] = await Promise.all([
        fetch('/api/academic-years'),
        fetch('/api/semesters')
      ]);

      if (!yearsResponse.ok) {
        throw new Error('Failed to fetch academic years');
      }

      if (!semestersResponse.ok) {
        throw new Error('Failed to fetch semesters');
      }

      const yearsData = await yearsResponse.json();
      const semestersData = await semestersResponse.json();

      const years = Array.isArray(yearsData) ? yearsData : (yearsData?.academicYears || []);
      const sems = Array.isArray(semestersData) ? semestersData : (semestersData?.semesters || []);

      // Sort years by year descending (newest first)
      const sortedYears = years.sort((a: AcademicYear, b: AcademicYear) => b.year - a.year);
      
      // Sort semesters by name
      const sortedSemesters = sems.sort((a: Semester, b: Semester) => 
        a.name.localeCompare(b.name)
      );

      setAcademicYears(sortedYears);
      setSemesters(sortedSemesters);
    } catch (err) {
      console.error('Error loading academic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load academic data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActiveAcademicYear = (): AcademicYear | null => {
    return academicYears.find(year => year.isActive) || null;
  };

  const getActiveSemester = (academicYearId?: string): Semester | null => {
    const targetYearId = academicYearId || getActiveAcademicYear()?.id;
    if (!targetYearId) return null;
    
    return semesters.find(semester => 
      semester.academicYearId === targetYearId && semester.isActive
    ) || null;
  };

  const getSemestersByYear = (academicYearId: string): Semester[] => {
    return semesters.filter(semester => semester.academicYearId === academicYearId);
  };

  return {
    academicYears,
    semesters,
    isLoading,
    error,
    refetch: loadData,
    getActiveAcademicYear,
    getActiveSemester,
    getSemestersByYear
  };
}
