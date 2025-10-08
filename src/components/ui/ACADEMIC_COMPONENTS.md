# 🎓 Academic Components Documentation

## Overview
This document describes the academic-related UI components for managing academic years and semesters in the internship system.

## Components

### 1. AcademicYearSelector

A dropdown component for selecting academic years.

#### Props
```typescript
interface AcademicYearSelectorProps {
  value?: string;                    // Selected academic year ID
  onChange: (academicYearId: string) => void;
  disabled?: boolean;                // Disable the selector
  lang?: 'th' | 'en';               // Language (default: 'th')
  className?: string;                // Additional CSS classes
  label?: string;                    // Custom label text
  placeholder?: string;              // Custom placeholder text
  showActiveOnly?: boolean;          // Show only active years (default: false)
  required?: boolean;                // Mark as required field
}
```

#### Usage
```tsx
import { AcademicYearSelector } from '@/components/ui';

function MyComponent() {
  const [selectedYear, setSelectedYear] = useState('');

  return (
    <AcademicYearSelector
      value={selectedYear}
      onChange={setSelectedYear}
      label="ปีการศึกษา"
      placeholder="เลือกปีการศึกษา"
      showActiveOnly={true}
      required
    />
  );
}
```

### 2. SemesterSelector

A dropdown component for selecting semesters, dependent on academic year.

#### Props
```typescript
interface SemesterSelectorProps {
  value?: string;                    // Selected semester ID
  onChange: (semesterId: string) => void;
  academicYearId?: string;           // Required: Academic year ID
  disabled?: boolean;                // Disable the selector
  lang?: 'th' | 'en';               // Language (default: 'th')
  className?: string;                // Additional CSS classes
  label?: string;                    // Custom label text
  placeholder?: string;              // Custom placeholder text
  showActiveOnly?: boolean;          // Show only active semesters (default: false)
  required?: boolean;                // Mark as required field
}
```

#### Usage
```tsx
import { SemesterSelector } from '@/components/ui';

function MyComponent() {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  return (
    <div className="grid grid-cols-2 gap-4">
      <AcademicYearSelector
        value={selectedYear}
        onChange={(yearId) => {
          setSelectedYear(yearId);
          setSelectedSemester(''); // Reset semester when year changes
        }}
      />
      <SemesterSelector
        value={selectedSemester}
        onChange={setSelectedSemester}
        academicYearId={selectedYear}
        label="ภาคเรียน"
      />
    </div>
  );
}
```

### 3. AcademicPeriodSelector

A combined component for selecting both academic year and semester.

#### Props
```typescript
interface AcademicPeriodSelectorProps {
  value?: AcademicPeriod;            // Selected period { academicYearId, semesterId }
  onChange: (period: AcademicPeriod) => void;
  disabled?: boolean;                // Disable the selector
  lang?: 'th' | 'en';               // Language (default: 'th')
  className?: string;                // Additional CSS classes
  showActiveOnly?: boolean;          // Show only active periods (default: false)
  required?: boolean;                // Mark as required field
  labels?: {                        // Custom labels
    academicYear?: string;
    semester?: string;
  };
  placeholders?: {                  // Custom placeholders
    academicYear?: string;
    semester?: string;
  };
}
```

#### Usage
```tsx
import { AcademicPeriodSelector } from '@/components/ui';

function MyComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState({
    academicYearId: '',
    semesterId: ''
  });

  return (
    <AcademicPeriodSelector
      value={selectedPeriod}
      onChange={setSelectedPeriod}
      labels={{
        academicYear: 'ปีการศึกษา',
        semester: 'ภาคเรียน'
      }}
      showActiveOnly={true}
      required
    />
  );
}
```

## Hooks

### useAcademicData

A custom hook for managing academic data.

#### Return Value
```typescript
interface UseAcademicDataReturn {
  academicYears: AcademicYear[];     // Array of academic years
  semesters: Semester[];             // Array of semesters
  isLoading: boolean;                // Loading state
  error: string | null;              // Error message
  refetch: () => Promise<void>;      // Refetch data
  getActiveAcademicYear: () => AcademicYear | null;
  getActiveSemester: (academicYearId?: string) => Semester | null;
  getSemestersByYear: (academicYearId: string) => Semester[];
}
```

#### Usage
```tsx
import { useAcademicData } from '@/hooks/use-academic-data';

function MyComponent() {
  const {
    academicYears,
    semesters,
    isLoading,
    error,
    getActiveAcademicYear,
    getSemestersByYear
  } = useAcademicData();

  const activeYear = getActiveAcademicYear();
  const yearSemesters = getSemestersByYear(selectedYearId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Active Year: {activeYear?.name}</p>
      <p>Semesters: {yearSemesters.length}</p>
    </div>
  );
}
```

## Features

### 1. Automatic Data Loading
- Components automatically load data from API endpoints
- Loading states and error handling included
- Data is cached and shared across components

### 2. Dependent Selection
- Semester selector automatically updates when academic year changes
- Semester options are filtered by selected academic year
- Automatic reset of dependent selections

### 3. Active Period Filtering
- `showActiveOnly` prop filters to show only active periods
- Useful for forms that should only allow current/active periods

### 4. Internationalization
- Support for Thai (`th`) and English (`en`) languages
- Customizable labels and placeholders
- Automatic fallback to default text

### 5. Form Integration
- Works seamlessly with React Hook Form
- Required field validation
- Disabled state support

## Best Practices

### 1. Use Combined Component When Possible
```tsx
// ✅ Good: Use AcademicPeriodSelector for related selections
<AcademicPeriodSelector
  value={period}
  onChange={setPeriod}
  showActiveOnly={true}
/>

// ❌ Avoid: Manual coordination unless needed
<AcademicYearSelector value={year} onChange={setYear} />
<SemesterSelector value={semester} onChange={setSemester} academicYearId={year} />
```

### 2. Handle Loading States
```tsx
// ✅ Good: Show loading state
if (isLoading) return <div>Loading academic data...</div>;

// ❌ Avoid: Showing empty selectors during loading
<AcademicYearSelector value={year} onChange={setYear} />
```

### 3. Reset Dependent Selections
```tsx
// ✅ Good: Reset semester when year changes
const handleYearChange = (yearId: string) => {
  setSelectedYear(yearId);
  setSelectedSemester(''); // Reset dependent selection
};
```

### 4. Use Active Periods for Current Data
```tsx
// ✅ Good: Use active periods for current applications
<AcademicPeriodSelector
  showActiveOnly={true}
  value={currentPeriod}
  onChange={setCurrentPeriod}
/>

// ✅ Good: Use all periods for historical data
<AcademicPeriodSelector
  showActiveOnly={false}
  value={historicalPeriod}
  onChange={setHistoricalPeriod}
/>
```

## API Endpoints

The components use the following API endpoints:

- `GET /api/academic-years` - Fetch academic years
- `GET /api/semesters` - Fetch all semesters
- `GET /api/semesters?academicYearId={id}` - Fetch semesters by year

## Error Handling

Components include built-in error handling:
- Network errors are caught and displayed
- Invalid data is handled gracefully
- Loading states prevent user interaction during data fetch

## Performance

- Data is loaded once and cached
- Components only re-render when necessary
- Efficient filtering and sorting
- Minimal API calls

## Examples

See `AcademicComponentsExample.tsx` for comprehensive usage examples.
