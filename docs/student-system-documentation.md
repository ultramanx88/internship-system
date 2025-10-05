# Student System Documentation

## Overview

This document provides comprehensive documentation for the Student system in the Internship Management System.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Student System                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components                                        │
│  ├── Student Dashboard (page.tsx)                          │
│  ├── Application Form (application-form/)                  │
│  ├── Applications List (applications/)                     │
│  ├── Internships (internships/)                            │
│  ├── Documents (documents/)                                │
│  ├── Evaluation (evaluation/)                              │
│  └── Settings (settings/)                                  │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints                                             │
│  ├── /api/student/dashboard                                │
│  ├── /api/student/applications                             │
│  └── /api/student/settings                                 │
├─────────────────────────────────────────────────────────────┤
│  Services & Utilities                                      │
│  ├── Authentication & Authorization                        │
│  ├── Input Sanitization & Validation                       │
│  ├── Caching System                                        │
│  ├── Rate Limiting                                         │
│  ├── Logging & Monitoring                                  │
│  └── Performance Optimization                              │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Student Dashboard API

#### GET /api/student/dashboard

Retrieve student dashboard data including applications, deadlines, and statistics.

**Headers:**
- `x-user-id`: Student ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "student_123",
      "name": "John Doe",
      "email": "john@student.university.ac.th",
      "roles": ["student"]
    },
    "applications": [
      {
        "id": "app_123",
        "status": "approved",
        "dateApplied": "2024-01-01T00:00:00.000Z",
        "internship": {
          "id": "internship_123",
          "title": "Software Development Intern",
          "company": {
            "id": "company_123",
            "name": "Tech Company Ltd."
          }
        }
      }
    ],
    "approvedApplication": { /* application object */ },
    "upcomingDeadlines": [
      {
        "id": "1",
        "title": "ส่งรายงานความคืบหน้า",
        "dueDate": "2024-01-15T00:00:00.000Z",
        "type": "report",
        "priority": "high"
      }
    ],
    "recentActivities": [
      {
        "id": "1",
        "type": "application",
        "message": "ส่งใบสมัครฝึกงานเรียบร้อยแล้ว",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "status": "success"
      }
    ],
    "stats": {
      "totalApplications": 5,
      "approvedApplications": 2,
      "pendingApplications": 1,
      "completedApplications": 2
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Internal Server Error

### Student Applications API

#### GET /api/student/applications

Retrieve student's applications with pagination.

**Headers:**
- `x-user-id`: Student ID (required)

**Query Parameters:**
- `status` (optional): Filter by status (all, pending, approved, rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_123",
        "studentId": "student_123",
        "internshipId": "internship_123",
        "status": "approved",
        "dateApplied": "2024-01-01T00:00:00.000Z",
        "feedback": "Student reason for application",
        "projectTopic": "Project proposal",
        "internship": {
          "id": "internship_123",
          "title": "Software Development Intern",
          "company": {
            "id": "company_123",
            "name": "Tech Company Ltd."
          }
        },
        "printRecord": null
      }
    ],
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

#### POST /api/student/applications

Create a new application.

**Headers:**
- `x-user-id`: Student ID (required)
- `x-csrf-token`: CSRF token (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "internshipId": "internship_123",
  "studentReason": "I want to gain experience in software development",
  "expectedSkills": "JavaScript, React, Node.js",
  "preferredStartDate": "2024-02-01",
  "availableDuration": "6 months",
  "projectProposal": "Develop a web application for company"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "studentId": "student_123",
    "internshipId": "internship_123",
    "status": "pending",
    "dateApplied": "2024-01-01T00:00:00.000Z",
    "feedback": "I want to gain experience in software development",
    "projectTopic": "Develop a web application for company",
    "internship": {
      "id": "internship_123",
      "title": "Software Development Intern",
      "company": {
        "id": "company_123",
        "name": "Tech Company Ltd."
      }
    }
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Bad Request (missing required fields or invalid input)
- `401`: Unauthorized
- `409`: Conflict (already applied)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Security Features

### Input Sanitization

All user inputs are sanitized to prevent XSS and injection attacks:

```typescript
import { sanitizeUserInput, sanitizeString } from '@/lib/security';

// Sanitize user input
const sanitizedBody = sanitizeUserInput(body);
if (!sanitizedBody.isValid) {
  return NextResponse.json({
    success: false,
    error: 'Invalid input data',
    details: sanitizedBody.errors
  }, { status: 400 });
}

// Additional sanitization
const sanitizedReason = sanitizeString(studentReason);
```

### Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Application Creation**: 10 applications per hour
- **Student-specific**: 50 requests per 15 minutes

```typescript
import { rateLimitMiddleware, applicationRateLimiter } from '@/lib/rate-limiter';

// Check rate limiting
const rateLimitResponse = rateLimitMiddleware(request, applicationRateLimiter);
if (rateLimitResponse) {
  return rateLimitResponse;
}
```

### CSRF Protection

State-changing operations require CSRF tokens:

```typescript
import { csrfMiddleware } from '@/lib/csrf';

// Check CSRF protection
const csrfResponse = csrfMiddleware(request);
if (csrfResponse) {
  return csrfResponse;
}
```

## Performance Optimization

### Caching System

API responses are cached to improve performance:

```typescript
import { studentCache, cacheKeys } from '@/lib/cache';

// Check cache first
const cacheKey = cacheKeys.studentApplications(user.id, page, limit);
const cached = studentCache.get(cacheKey);
if (cached) {
  return NextResponse.json(cached);
}

// Cache the response for 5 minutes
studentCache.set(cacheKey, response, 5 * 60 * 1000);
```

### Pagination

Large datasets are paginated to improve performance:

```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
const skip = (page - 1) * limit;

const [applications, total] = await Promise.all([
  prisma.application.findMany({
    where: whereClause,
    skip,
    take: limit,
    // ... other options
  }),
  prisma.application.count({ where: whereClause }),
]);
```

### Memoization

React components use memoization to prevent unnecessary re-renders:

```typescript
import { useMemoizedCallback } from '@/hooks/use-memoized-callback';

const handleSubmit = useMemoizedCallback((data) => {
  // Handle form submission
}, [dependencies]);
```

## Logging & Monitoring

### Structured Logging

All operations are logged with structured data:

```typescript
import { logger } from '@/lib/logger';

logger.info('Student Applications API - GET request started', {
  userId: user.id,
  status,
  page,
  limit,
});

logger.error('Student Applications API Error', {
  error: error.message,
  stack: error.stack,
  duration,
});
```

### Performance Monitoring

API response times are monitored:

```typescript
import { PerformanceMonitor } from '@/lib/logger';

const duration = PerformanceMonitor.measure('api-request', () => {
  // API operation
});
```

## Testing

### Unit Tests

API endpoints are tested with comprehensive unit tests:

```typescript
describe('/api/student/applications', () => {
  it('should return applications successfully', async () => {
    // Test implementation
  });

  it('should handle authentication error', async () => {
    // Test implementation
  });

  it('should handle rate limiting', async () => {
    // Test implementation
  });
});
```

### Component Tests

React components are tested with React Testing Library:

```typescript
describe('StudentPage', () => {
  it('renders loading state initially', () => {
    // Test implementation
  });

  it('renders dashboard data after loading', async () => {
    // Test implementation
  });
});
```

## Error Handling

### API Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Frontend Error Handling

React components handle errors gracefully:

```typescript
const [error, setError] = useState<string | null>(null);

try {
  const response = await fetch('/api/student/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const result = await response.json();
  setDashboardData(result.data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

## Usage Examples

### Fetching Dashboard Data

```typescript
const fetchDashboardData = async () => {
  try {
    const response = await fetch('/api/student/dashboard', {
      headers: {
        'x-user-id': user.id,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const result = await response.json();
    if (result.success) {
      setDashboardData(result.data);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setError(error.message);
  }
};
```

### Creating an Application

```typescript
const createApplication = async (applicationData) => {
  try {
    const response = await fetch('/api/student/applications', {
      method: 'POST',
      headers: {
        'x-user-id': user.id,
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    const result = await response.json();
    if (result.success) {
      // Handle success
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error creating application:', error);
  }
};
```

## Best Practices

1. **Always validate user input** before processing
2. **Use proper error handling** with try-catch blocks
3. **Implement rate limiting** to prevent abuse
4. **Cache frequently accessed data** to improve performance
5. **Log important operations** for debugging and monitoring
6. **Use pagination** for large datasets
7. **Sanitize user inputs** to prevent security vulnerabilities
8. **Test thoroughly** with unit and integration tests
9. **Monitor performance** and optimize as needed
10. **Document APIs** for easy maintenance and development

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure `x-user-id` header is included
   - Check if user has proper role permissions

2. **Rate Limiting**
   - Check rate limit headers in response
   - Implement exponential backoff for retries

3. **CSRF Protection**
   - Ensure CSRF token is included in requests
   - Generate new token if expired

4. **Cache Issues**
   - Clear cache if data seems stale
   - Check cache TTL settings

5. **Performance Issues**
   - Monitor API response times
   - Check database query performance
   - Verify caching is working properly

### Debug Mode

Enable debug logging in development:

```typescript
import { logger } from '@/lib/logger';

// Set debug level
logger.setLevel(LogLevel.DEBUG);
```

This will provide detailed logging information for debugging purposes.
