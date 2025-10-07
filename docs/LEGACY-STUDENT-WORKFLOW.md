## Legacy Student Workflow (Archived)

This document snapshots the previous student application workflow so we can simplify the UI while keeping the old behavior referenced.

### Required profile fields (>= 80% complete)
name, email, t_name, t_surname, t_title, phone, majorId, departmentId, facultyId, curriculumId

Checked in `src/lib/student-workflow.ts` via `checkStudentProfileComplete`.

### Current-step logic (old)
- profile_incomplete → Step 1 active
- profile_complete and no application → Step 2 active
- application submitted (pending) → Step 2 active (waiting)
- staff reviewed (approved/rejected) → Step 4 active

### Caching
Applications list cached for 5 minutes; appending `?refresh=true` forces fresh fetch.

### Main files
- `src/lib/student-workflow.ts`
- `src/app/api/student/workflow/route.ts`
- `src/app/(dashboard)/student/application-form/page.tsx`
- `src/components/student/StudentWorkflowStatus.tsx`

### Why archived
We are simplifying the UX: allow proceeding immediately after saving (and after opening the application form), with a small notice if profile is not fully complete. Old rules are preserved here for future re-enable if needed.

## Legacy Student Workflow (Archived)

This document freezes the previous workflow behavior for student application steps.

### Key Rules
- Profile completeness gate (>= 80%) using fields: name, email, t_name, t_surname, t_title, phone, majorId, departmentId, facultyId, curriculumId
- Current step logic
  - profile_incomplete → Step 1 active
  - profile_complete & no application → Step 2 active
  - application submitted (pending) → Step 2 active (waiting)
  - staff reviewed (approved/rejected) → Step 4 active
- Timeline UI always reflects exactly one active step
- Applications list cached for 5 minutes;  forces bypass cache

### Main Files
- 
- 
- 
- 

### Reason for Archive
We are simplifying UX to let students proceed immediately after saving without being blocked by the timeline. The legacy rules are preserved here for reference and possible re-enablement.

