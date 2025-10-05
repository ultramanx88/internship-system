# Component Documentation

## Overview

This document provides comprehensive documentation for React components in the Internship Management System.

## Settings Components

### FacultyManagement

**Location**: `src/components/admin/settings/FacultyManagement.tsx`

**Purpose**: Manages faculty data including creation, editing, and deletion.

**Props**: None (uses hooks for data management)

**Features**:
- Display list of faculties in a table format
- Add new faculty entries
- Edit existing faculty information
- Delete faculty entries
- Save changes to the database
- Input validation and error handling

**State**:
```typescript
const [faculties, setFaculties] = useState<Omit<Faculty, 'createdAt' | 'updatedAt'>[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
```

**Hooks Used**:
- `useAuth()`: For user authentication
- `useToast()`: For displaying notifications

**API Endpoints**:
- `GET /api/faculties`: Fetch faculties
- `POST /api/faculties`: Create new faculty
- `PUT /api/faculties/[id]`: Update faculty
- `DELETE /api/faculties/[id]`: Delete faculty

**Example Usage**:
```tsx
import { FacultyManagement } from '@/components/admin/settings/FacultyManagement';

function SettingsPage() {
  return (
    <div>
      <FacultyManagement />
    </div>
  );
}
```

### MajorManagement

**Location**: `src/components/admin/settings/MajorManagement.tsx`

**Purpose**: Manages major data within curricula.

**Features**:
- Display list of majors
- Filter by curriculum
- Add new major entries
- Edit existing major information
- Delete major entries

### TitleManagement

**Location**: `src/components/admin/settings/TitleManagement.tsx`

**Purpose**: Manages academic titles and prefixes.

**Features**:
- Manage Thai and English titles
- Add/remove title options
- Validation for title formats

### AcademicCalendarSettings

**Location**: `src/components/admin/settings/AcademicCalendarSettings.tsx`

**Purpose**: Manages academic calendar settings.

**Features**:
- Set academic years
- Configure semesters
- Manage important dates
- Holiday management

### RoleManagementMatrix

**Location**: `src/components/admin/settings/RoleManagementMatrix.tsx`

**Purpose**: Manages user roles and permissions.

**Features**:
- Display role matrix
- Modify permissions
- Add new roles
- Remove existing roles

## Authentication Components

### AdminGuard

**Location**: `src/components/auth/PermissionGuard.tsx`

**Purpose**: Protects admin-only pages and components.

**Props**:
```typescript
interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage**:
```tsx
import { AdminGuard } from '@/components/auth/PermissionGuard';

function AdminPage() {
  return (
    <AdminGuard>
      <div>Admin content here</div>
    </AdminGuard>
  );
}
```

### PermissionGuard

**Location**: `src/components/auth/PermissionGuard.tsx`

**Purpose**: Generic permission guard for role-based access control.

**Props**:
```typescript
interface PermissionGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage**:
```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function RestrictedPage() {
  return (
    <PermissionGuard allowedRoles={['admin', 'staff']}>
      <div>Restricted content here</div>
    </PermissionGuard>
  );
}
```

## UI Components

### Card Components

**Location**: `src/components/ui/card.tsx`

**Components**:
- `Card`: Main card container
- `CardHeader`: Card header section
- `CardTitle`: Card title
- `CardDescription`: Card description
- `CardContent`: Card content area
- `CardFooter`: Card footer section

**Usage**:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        Card content here
      </CardContent>
    </Card>
  );
}
```

### Form Components

**Location**: `src/components/ui/`

**Components**:
- `Input`: Text input field
- `Button`: Button component
- `Label`: Form label
- `Switch`: Toggle switch
- `Select`: Dropdown select
- `Textarea`: Multi-line text input

**Usage**:
```tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function MyForm() {
  return (
    <div>
      <Label htmlFor="name">Name</Label>
      <Input id="name" type="text" />
      <Button type="submit">Submit</Button>
    </div>
  );
}
```

### Table Components

**Location**: `src/components/ui/table.tsx`

**Components**:
- `Table`: Main table container
- `TableHeader`: Table header
- `TableBody`: Table body
- `TableRow`: Table row
- `TableHead`: Table header cell
- `TableCell`: Table data cell

**Usage**:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function DataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## Hooks

### useAuth

**Location**: `src/hooks/use-auth.ts`

**Purpose**: Provides authentication context and user information.

**Returns**:
```typescript
{
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
}
```

**Usage**:
```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### useToast

**Location**: `src/hooks/use-toast.ts`

**Purpose**: Provides toast notification functionality.

**Returns**:
```typescript
{
  toast: (options: ToastOptions) => void;
}
```

**Usage**:
```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Operation completed successfully',
    });
  };
  
  const handleError = () => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Something went wrong',
    });
  };
}
```

## Security Features

### Input Sanitization

All components that handle user input automatically sanitize data:

```tsx
import { sanitizeString } from '@/lib/security';

function MyInput({ value, onChange }) {
  const handleChange = (e) => {
    const sanitized = sanitizeString(e.target.value);
    onChange(sanitized);
  };
  
  return <input value={value} onChange={handleChange} />;
}
```

### Permission Checking

Components check user permissions before rendering:

```tsx
import { useAuth } from '@/hooks/use-auth';

function AdminOnlyComponent() {
  const { user } = useAuth();
  
  if (!user?.roles.includes('admin')) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin content</div>;
}
```

## Testing

### Component Testing

Components are tested using React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FacultyManagement } from '../FacultyManagement';

test('renders faculty management', () => {
  render(<FacultyManagement />);
  expect(screen.getByText('จัดการคณะ')).toBeInTheDocument();
});
```

### Hook Testing

Hooks are tested using React Testing Library's `renderHook`:

```tsx
import { renderHook } from '@testing-library/react';
import { useAuth } from '../use-auth';

test('useAuth returns user data', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.user).toBeDefined();
});
```

## Best Practices

1. **Component Composition**: Use composition over inheritance
2. **Props Validation**: Use TypeScript interfaces for props
3. **Error Boundaries**: Wrap components in error boundaries
4. **Loading States**: Always handle loading states
5. **Accessibility**: Use semantic HTML and ARIA attributes
6. **Performance**: Use React.memo for expensive components
7. **Testing**: Write tests for all components
8. **Documentation**: Document all props and usage examples
