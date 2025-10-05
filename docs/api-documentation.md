# API Documentation

## Overview

This document provides comprehensive API documentation for the Internship Management System.

## Authentication

All API endpoints require authentication via the `x-user-id` header.

```http
x-user-id: user_id_here
```

## Base URL

- **Development**: `http://localhost:8080`
- **Production**: `https://your-domain.com`

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Settings API Endpoints

### Faculties

#### GET /api/faculties

Retrieve all faculties.

**Headers:**
- `x-user-id`: User ID (required)

**Query Parameters:**
- `include` (optional): Set to `true` to include relations

**Response:**
```json
{
  "faculties": [
    {
      "id": "faculty_1",
      "nameTh": "คณะเทคโนโลยีสารสนเทศ",
      "nameEn": "Faculty of Information Technology",
      "code": "IT",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "departments": 2,
        "users": 10
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Internal Server Error

#### POST /api/faculties

Create a new faculty.

**Headers:**
- `x-user-id`: User ID (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "nameTh": "คณะเทคโนโลยีสารสนเทศ",
  "nameEn": "Faculty of Information Technology",
  "code": "IT"
}
```

**Response:**
```json
{
  "id": "faculty_1",
  "nameTh": "คณะเทคโนโลยีสารสนเทศ",
  "nameEn": "Faculty of Information Technology",
  "code": "IT",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "_count": {
    "departments": 0,
    "users": 0
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Bad Request (missing required fields or duplicate name)
- `401`: Unauthorized
- `500`: Internal Server Error

### Majors

#### GET /api/majors

Retrieve all majors.

**Headers:**
- `x-user-id`: User ID (required)

**Query Parameters:**
- `curriculumId` (optional): Filter by curriculum ID

**Response:**
```json
{
  "majors": [
    {
      "id": "major_1",
      "nameTh": "วิศวกรรมซอฟต์แวร์",
      "nameEn": "Software Engineering",
      "curriculumId": "curriculum_1",
      "area": "Technology",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "curriculum": {
        "id": "curriculum_1",
        "nameTh": "หลักสูตรวิศวกรรมคอมพิวเตอร์",
        "department": {
          "id": "dept_1",
          "nameTh": "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          "faculty": {
            "id": "faculty_1",
            "nameTh": "คณะเทคโนโลยีสารสนเทศ"
          }
        }
      },
      "_count": {
        "users": 5
      }
    }
  ]
}
```

#### POST /api/majors

Create a new major.

**Headers:**
- `x-user-id`: User ID (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "nameTh": "วิศวกรรมซอฟต์แวร์",
  "nameEn": "Software Engineering",
  "curriculumId": "curriculum_1",
  "area": "Technology"
}
```

**Response:**
```json
{
  "id": "major_1",
  "nameTh": "วิศวกรรมซอฟต์แวร์",
  "nameEn": "Software Engineering",
  "curriculumId": "curriculum_1",
  "area": "Technology",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "curriculum": {
    "id": "curriculum_1",
    "nameTh": "หลักสูตรวิศวกรรมคอมพิวเตอร์",
    "department": {
      "id": "dept_1",
      "nameTh": "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      "faculty": {
        "id": "faculty_1",
        "nameTh": "คณะเทคโนโลยีสารสนเทศ"
      }
    }
  },
  "_count": {
    "users": 0
  }
}
```

## Security Features

### Input Sanitization

All API endpoints automatically sanitize input data to prevent:

- **XSS Attacks**: Removes `<script>` tags and `javascript:` protocols
- **SQL Injection**: Removes SQL keywords and special characters
- **HTML Injection**: Removes dangerous HTML tags

### Rate Limiting

API endpoints implement rate limiting:

- **Default**: 100 requests per 15 minutes per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### CSRF Protection

For state-changing operations, CSRF tokens are required:

**Headers:**
- `x-csrf-token`: CSRF token (required for POST/PUT/DELETE)
- `x-session-id`: Session ID (required for CSRF validation)

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "error": "Error message",
  "details": ["Additional error details"],
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Examples

### Create Faculty

```bash
curl -X POST http://localhost:8080/api/faculties \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin_user" \
  -d '{
    "nameTh": "คณะเทคโนโลยีสารสนเทศ",
    "nameEn": "Faculty of Information Technology",
    "code": "IT"
  }'
```

### Get Faculties

```bash
curl -X GET http://localhost:8080/api/faculties \
  -H "x-user-id: admin_user"
```

### Create Major

```bash
curl -X POST http://localhost:8080/api/majors \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin_user" \
  -d '{
    "nameTh": "วิศวกรรมซอฟต์แวร์",
    "nameEn": "Software Engineering",
    "curriculumId": "curriculum_1",
    "area": "Technology"
  }'
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per user
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 status code when limit is exceeded

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **Authentication**: All endpoints require valid user authentication
3. **Authorization**: Role-based access control is enforced
4. **Rate Limiting**: Prevents abuse and DoS attacks
5. **CSRF Protection**: Prevents cross-site request forgery
6. **SQL Injection Prevention**: Input sanitization prevents SQL injection
7. **XSS Prevention**: Output encoding prevents cross-site scripting

## Testing

The API includes comprehensive test coverage:

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Input validation and sanitization testing
- **Performance Tests**: Rate limiting and response time testing

Run tests with:
```bash
npm test
npm run test:coverage
```
