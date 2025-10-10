-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'course_instructor_pending';
ALTER TYPE "ApplicationStatus" ADD VALUE 'course_instructor_approved';
ALTER TYPE "ApplicationStatus" ADD VALUE 'course_instructor_rejected';
ALTER TYPE "ApplicationStatus" ADD VALUE 'supervisor_assignment_pending';

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "courseInstructorApprovedAt" TIMESTAMP(3),
ADD COLUMN     "courseInstructorRejectedAt" TIMESTAMP(3),
ADD COLUMN     "courseInstructorRejectionNote" TEXT,
ADD COLUMN     "supervisorAppointmentDate" TIMESTAMP(3),
ADD COLUMN     "supervisorAppointmentLocation" TEXT,
ADD COLUMN     "supervisorAppointmentNotes" TEXT;
