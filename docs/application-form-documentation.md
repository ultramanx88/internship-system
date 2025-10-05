# Application Form System Documentation

## Overview

This document provides comprehensive documentation for the Application Form system in the Internship Management System. The system handles student applications for internships and co-op programs with a progressive workflow approach.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                Application Form System                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components                                        │
│  ├── ApplicationFormPage (Timeline Overview)               │
│  ├── ApplicationFormTypePage (Form Submission)             │
│  ├── InternshipFormPage (Detailed Form)                    │
│  └── DocumentPreview (Form Preview)                        │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints                                             │
│  ├── /api/student/applications (GET, POST)                 │
│  ├── /api/applications (GET, POST)                         │
│  └── /api/internships (GET)                                │
├─────────────────────────────────────────────────────────────┤
│  Services & Utilities                                      │
│  ├── Progressive Workflow Logic                            │
│  ├── Form Validation & Sanitization                        │
│  ├── Caching & Performance                                 │
│  ├── Security & Authentication                             │
│  └── Logging & Monitoring                                  │
└─────────────────────────────────────────────────────────────┘
```

## Progressive Workflow

### Timeline Steps

The application form follows a progressive workflow with 5 main steps:

1. **ลงทะเบียนข้อมูลนักศึกษา** (Student Registration)
   - Status: `completed` | `current` | `upcoming`
   - Required fields: `name`, `email`, `phone`, `t_name`, `t_surname`, `facultyId`, `majorId`
   - Action: Navigate to `/student/settings`

2. **กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน** (Application Form)
   - Status: `completed` | `current` | `upcoming`
   - Prerequisites: Student must be registered
   - Action: Navigate to `/student/application-form/internship-form`

3. **ยื่นเอกสารให้กับทางบริษัท** (Document Submission)
   - Status: `completed` | `current` | `upcoming`
   - Prerequisites: Application must be submitted
   - Action: Navigate to `/student/documents`

4. **ช่วงสหกิจศึกษา / ฝึกงาน** (Internship Period)
   - Status: `completed` | `current` | `upcoming`
   - Prerequisites: Application must be approved
   - Action: Navigate to `/student/internships`

5. **กรอกหัวข้อโปรเจกต์** (Project Details)
   - Status: `completed` | `current` | `upcoming`
   - Prerequisites: Internship must be completed
   - Action: Navigate to `/student/project-details`

### Workflow Logic

```typescript
// Step 1: Student Registration Check
const isStudentRegistered = user.name && user.email && user.phone && 
                          user.t_name && user.t_surname && 
                          user.facultyId && user.majorId;

// Step 2: Application Status Check
const hasApplied = myApplications.length > 0;
const hasApproved = myApplications.some(app => app.status === 'approved');
const hasCompleted = myApplications.some(app => app.status === 'completed');

// Timeline Step Status Logic
const steps = [
  {
    step: 1,
    status: isStudentRegistered ? 'completed' : 'current',
    isEditable: !isStudentRegistered,
  },
  {
    step: 2,
    status: hasApplied ? 'completed' : (isStudentRegistered ? 'current' : 'upcoming'),
    isEditable: isStudentRegistered && !hasApplied,
  },
  // ... other steps
];
```

## Form Components

### ApplicationFormPage

**Purpose**: Main timeline overview page showing student progress

**Key Features**:
- Progressive workflow visualization
- Student registration status check
- Application status tracking
- Dynamic step enabling/disabling

**Props**: None (uses `useAuth` hook)

**State Management**:
```typescript
const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isStudentRegistered, setIsStudentRegistered] = useState(false);
```

### ApplicationFormTypePage

**Purpose**: Form submission page for internship/co-op applications

**Key Features**:
- Form validation and sanitization
- CSRF protection
- Debounced input handling
- Auto-save functionality

**Props**: 
- `type`: `'internship' | 'co_op'`

**State Management**:
```typescript
const [formData, setFormData] = useState<ApplicationFormData>({...});
const [debouncedFormData, setDebouncedFormData] = useState<ApplicationFormData>({...});
const [csrfToken, setCsrfToken] = useState<string>('');
```

### InternshipFormPage

**Purpose**: Detailed form for internship/co-op applications

**Key Features**:
- Company information form
- Address management (provinces, districts, subdistricts)
- Document preview
- Local storage draft saving

## API Endpoints

### GET /api/student/applications

Fetch applications for authenticated student.

**Headers**:
- `x-user-id`: Student ID (required)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort order (`asc` | `desc`, default: `desc`)

**Response**:
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### POST /api/student/applications

Create a new application.

**Headers**:
- `x-user-id`: Student ID (required)
- `x-csrf-token`: CSRF token (required)
- `Content-Type`: application/json

**Request Body**:
```json
{
  "internshipId": "intern_123",
  "studentReason": "I want to gain experience in software development",
  "expectedSkills": "JavaScript, React, Node.js",
  "preferredStartDate": "2024-02-01",
  "availableDuration": "6 months",
  "projectProposal": "Develop a web application for company"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "studentId": "student_123",
    "internshipId": "intern_123",
    "status": "pending",
    "dateApplied": "2024-01-01T00:00:00.000Z",
    "feedback": "I want to gain experience in software development",
    "projectTopic": "Develop a web application for company"
  }
}
```

## Security Features

### Input Sanitization

All form inputs are sanitized to prevent XSS attacks:

```typescript
// Text fields with potential HTML content
sanitizedValue = sanitizeHtml(e.target.value);

// Other string fields
sanitizedValue = sanitizeString(e.target.value);
```

### CSRF Protection

Forms include CSRF tokens for protection:

```typescript
// Generate token on component mount
const token = generateCsrfToken();
setCsrfToken(token);

// Include in API calls
headers: {
  'x-csrf-token': csrfToken,
}
```

### Authentication & Authorization

- `StudentGuard` wrapper ensures only students can access forms
- Server-side authentication checks in API endpoints
- Role-based access control

## Performance Optimizations

### Caching

- API responses cached for 5 minutes
- Form data cached in `studentCache`
- Memoized expensive operations

### Debouncing

- Form inputs debounced by 500ms
- Prevents excessive API calls during typing

### Memoization

- `getDefaultTimeline` function memoized
- Prevents unnecessary re-renders

## Logging & Monitoring

### Structured Logging

```typescript
logger.info('ApplicationFormPage: Checking student status', { 
  userId: user.id, 
  userName: user.name 
});

logger.error('ApplicationFormPage: Error checking student status', { 
  userId: user?.id,
  error: error.message,
  stack: error.stack
});
```

### Performance Monitoring

```typescript
const perfMonitor = new PerformanceMonitor('ApplicationFormPage:checkStudentStatus');
// ... operations
perfMonitor.end();
```

## Testing

### Unit Tests

- Component rendering tests
- Form validation tests
- Error handling tests
- User interaction tests

### Integration Tests

- API endpoint tests
- Authentication tests
- Data flow tests

## Error Handling

### Client-Side Errors

```typescript
try {
  // Form operations
} catch (error) {
  logger.error('ApplicationFormPage: Error', { 
    userId: user?.id,
    error: error.message 
  });
  // Show user-friendly error message
}
```

### Server-Side Errors

```typescript
try {
  // API operations
} catch (error) {
  logger.error('Student Applications API Error:', error);
  return NextResponse.json(
    { 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    { status: 500 }
  );
}
```

## Usage Examples

### Basic Form Usage

```typescript
// Check student registration status
const isStudentRegistered = user.name && user.email && user.phone && 
                          user.t_name && user.t_surname && 
                          user.facultyId && user.majorId;

// Handle form input with sanitization
const handleInputChange = (field: keyof ApplicationFormData) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const sanitizedValue = sanitizeString(e.target.value);
  setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
};

// Submit form with CSRF protection
const response = await fetch('/api/applications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify(formData),
});
```

### Progressive Workflow Implementation

```typescript
// Create timeline steps based on student status
const createTimelineSteps = (isRegistered: boolean, hasApplied: boolean, hasApproved: boolean) => {
  return [
    {
      step: 1,
      status: isRegistered ? 'completed' : 'current',
      isEditable: !isRegistered,
    },
    {
      step: 2,
      status: hasApplied ? 'completed' : (isRegistered ? 'current' : 'upcoming'),
      isEditable: isRegistered && !hasApplied,
    },
    // ... other steps
  ];
};
```

## Best Practices

1. **Always validate user input** before processing
2. **Use proper error handling** with try-catch blocks
3. **Implement rate limiting** to prevent abuse
4. **Cache frequently accessed data** to improve performance
5. **Use structured logging** for better debugging
6. **Implement progressive workflow** for better UX
7. **Sanitize all inputs** to prevent XSS attacks
8. **Use CSRF protection** for form submissions
9. **Implement proper authentication** and authorization
10. **Monitor performance** and optimize accordingly

## Troubleshooting

### Common Issues

1. **Form not submitting**
   - Check CSRF token
   - Verify authentication
   - Check network connectivity

2. **Timeline steps not updating**
   - Verify student registration status
   - Check application data
   - Clear cache if needed

3. **Performance issues**
   - Check cache configuration
   - Monitor API response times
   - Verify debouncing settings

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check server logs for detailed error information
4. Verify user authentication status
5. Check form validation errors

## Future Enhancements

1. **Real-time updates** for application status
2. **Bulk operations** for multiple applications
3. **Advanced form validation** with real-time feedback
4. **Mobile optimization** for better mobile experience
5. **Offline support** for form completion
6. **Advanced analytics** for form usage tracking
