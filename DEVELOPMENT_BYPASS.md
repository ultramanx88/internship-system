# Development Authentication Bypass

## Overview
This document describes the development authentication bypass feature for the `/educator/coop-requests` route.

## How It Works

### 1. API Route Bypass (`/api/educator/coop-requests`)
- **Trigger**: When `NODE_ENV=development` AND `x-dev-bypass=true` header is present
- **Behavior**: Creates a mock user with `courseInstructor` role and processes the request normally
- **Security**: Only works in development environment

### 2. Frontend Bypass (`/educator/coop-requests`)
- **Trigger**: When `NODE_ENV=development` AND no user is authenticated or no educator role
- **Behavior**: 
  - Skips authentication checks
  - Sends `x-dev-bypass=true` header to API
  - Shows development mode indicator
  - Bypasses loading and error states

## Usage

### For Development
1. Set `NODE_ENV=development` in your environment
2. Navigate to any of these routes without logging in:
   - `/educator/coop-requests`
   - `/educator/assign-advisor`
3. The pages will automatically use bypass mode
4. You'll see a yellow development mode indicator on each page

### For Testing
```bash
# Set development environment
export NODE_ENV=development

# Start the development server
npm run dev

# Navigate to the route
# http://localhost:3000/educator/coop-requests
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Development Only**: This bypass only works when `NODE_ENV=development`
2. **No Production Impact**: The bypass is completely disabled in production
3. **Mock Data**: Uses mock user data, not real database queries
4. **Header Required**: Requires specific `x-dev-bypass=true` header

## Code Locations

### API Route
- File: `src/app/api/educator/coop-requests/route.ts`
- Lines: 9-22 (bypass logic)

### Frontend Components
- File: `src/app/(dashboard)/educator/coop-requests/page.tsx`
  - Lines: 84-91, 112-117, 173-180, 317-319, 361-371 (bypass logic)
- File: `src/app/(dashboard)/educator/assign-advisor/page.tsx`
  - Lines: 69-81, 84-98, 399-401, 418-428 (bypass logic)

## Mock User Data
```typescript
const mockUser = {
  id: 'dev_user_001',
  name: 'Development User',
  roles: ['courseInstructor']
};
```

## Troubleshooting

### Bypass Not Working
1. Check that `NODE_ENV=development`
2. Verify you're not logged in or have no educator role
3. Check browser console for bypass messages
4. Look for the yellow development mode indicator

### Still Getting Auth Errors
1. Clear browser localStorage
2. Restart the development server
3. Check that the API route has the bypass logic
4. Verify the frontend is sending the correct headers

## Disabling Bypass

To disable the bypass temporarily:
1. Comment out the bypass logic in both files
2. Or set `NODE_ENV=production` (not recommended for dev)
3. Or ensure you're properly logged in with educator role
