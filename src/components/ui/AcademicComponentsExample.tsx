'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  AcademicYearSelector, 
  SemesterSelector, 
  AcademicPeriodSelector,
  useAcademicData 
} from './index';

export function AcademicComponentsExample() {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState({ academicYearId: '', semesterId: '' });
  
  const { academicYears, semesters, isLoading, error, getActiveAcademicYear } = useAcademicData();

  const handleYearChange = (academicYearId: string) => {
    setSelectedYear(academicYearId);
    setSelectedSemester(''); // Reset semester when year changes
  };

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemester(semesterId);
  };

  const handlePeriodChange = (period: { academicYearId: string; semesterId: string }) => {
    setSelectedPeriod(period);
  };

  const activeYear = getActiveAcademicYear();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Academic Components Examples</h1>
      
      {/* Basic Academic Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>1. Basic Academic Year Selector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AcademicYearSelector
            value={selectedYear}
            onChange={handleYearChange}
            label="ปีการศึกษา"
            placeholder="เลือกปีการศึกษา"
          />
          <p className="text-sm text-muted-foreground">
            Selected: {selectedYear || 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Academic Year with Semester */}
      <Card>
        <CardHeader>
          <CardTitle>2. Academic Year with Semester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AcademicYearSelector
              value={selectedYear}
              onChange={handleYearChange}
              label="ปีการศึกษา"
              placeholder="เลือกปีการศึกษา"
            />
            <SemesterSelector
              value={selectedSemester}
              onChange={handleSemesterChange}
              academicYearId={selectedYear}
              label="ภาคเรียน"
              placeholder="เลือกภาคเรียน"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedYear && selectedSemester ? `${selectedYear} - ${selectedSemester}` : 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Combined Academic Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>3. Combined Academic Period Selector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AcademicPeriodSelector
            value={selectedPeriod}
            onChange={handlePeriodChange}
            labels={{
              academicYear: 'ปีการศึกษา',
              semester: 'ภาคเรียน'
            }}
            placeholders={{
              academicYear: 'เลือกปีการศึกษา',
              semester: 'เลือกภาคเรียน'
            }}
          />
          <p className="text-sm text-muted-foreground">
            Selected: {selectedPeriod.academicYearId && selectedPeriod.semesterId 
              ? `${selectedPeriod.academicYearId} - ${selectedPeriod.semesterId}` 
              : 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Active Only Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>4. Active Only Selectors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AcademicYearSelector
            value={selectedYear}
            onChange={handleYearChange}
            showActiveOnly={true}
            label="ปีการศึกษาที่ใช้งาน"
            placeholder="เลือกปีการศึกษาที่ใช้งาน"
          />
          <p className="text-sm text-muted-foreground">
            Active Year: {activeYear ? activeYear.name : 'None'}
          </p>
        </CardContent>
      </Card>

      {/* English Language */}
      <Card>
        <CardHeader>
          <CardTitle>5. English Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AcademicPeriodSelector
            value={selectedPeriod}
            onChange={handlePeriodChange}
            lang="en"
            labels={{
              academicYear: 'Academic Year',
              semester: 'Semester'
            }}
            placeholders={{
              academicYear: 'Select academic year',
              semester: 'Select semester'
            }}
          />
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>6. Raw Data Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-destructive">Error: {error}</p>}
          {!isLoading && !error && (
            <div className="space-y-2">
              <p><strong>Academic Years ({academicYears.length}):</strong></p>
              <ul className="list-disc list-inside text-sm">
                {academicYears.map(year => (
                  <li key={year.id}>
                    {year.name} {year.isActive && '(Active)'}
                  </li>
                ))}
              </ul>
              
              <p><strong>Semesters ({semesters.length}):</strong></p>
              <ul className="list-disc list-inside text-sm">
                {semesters.map(semester => (
                  <li key={semester.id}>
                    {semester.name} {semester.isActive && '(Active)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
