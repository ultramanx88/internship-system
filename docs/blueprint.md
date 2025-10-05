# **App Name**: InternshipFlow

## Core Features:

- User Authentication: Implement a login page for student, teacher and admin authentication and authorization.
- Profile Creation: Enable students to provide all required informations and register themselves in the system.
- Internship Application: Enable students to request an internship position.
- Teacher Review Tool: Implement a tool which allows the teacher to decide about student applications, to allow/disallow each application.
- Approval Process Tracking: Allow the system to notify about acceptance/rejection. Keep track of requests at all states, and provide statistics for the admin.
- Progress tracking: Allow students to report about the progress in the internship.

## Admin/Staff Users Listing

- Endpoints
  - GET `/api/users` (roles: admin, staff)
    - Query: `search`, `role`, `sort`, `page`, `limit`
    - Rate limit: 120 requests / 15 minutes per user (`X-RateLimit-*` headers)
  - GET `/api/students` (roles: admin, staff)
    - Query: `search`, `role=student|educator|students+educators`, `page`, `limit`
    - Rate limit: 120 requests / 15 minutes per user

- Client
  - `staff/users` uses `UsersTable` with `defaultRole="students+educators"` and `lockRole` to pull from `/api/students`.
  - `admin/users` uses `UsersTable` with `/api/users`.

- Notes
  - Authentication via header `x-user-id` (temporary)
  - Pagination and minimal select fields for performance
  - Roles stored as JSON string in DB; parsed before response

## Style Guidelines:

- Primary color: A calm, professional blue (#2979FF) reflecting trust and efficiency.
- Background color: Light blue-gray (#E0E8FF) for a clean and unobtrusive backdrop.
- Accent color: A subtle green (#90EE90) to indicate approval and progress.
- Body and headline font: 'Inter', a sans-serif font, to maintain the modern and machined UI look.
- Use consistent and clear icons to represent different actions and statuses throughout the application process.
- Maintain a clean and organized layout with clear visual hierarchy to guide users through the internship process.
- Incorporate subtle animations and transitions to provide feedback and enhance user engagement.