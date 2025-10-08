import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const educatorRoles = await prisma.educatorRole.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(educatorRoles);
  } catch (error) {
    console.error('Error fetching educator roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch educator roles' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { educatorRoles, courseInstructors } = await request.json();

    // Update educator roles
    for (const role of educatorRoles) {
      if (role.id.startsWith('new-')) {
        // Create new educator role
        await prisma.educatorRole.create({
          data: {
            name: role.name,
            nameEn: role.nameEn,
            description: role.description,
            isActive: role.isActive
          }
        });
      } else {
        // Update existing educator role
        await prisma.educatorRole.update({
          where: { id: role.id },
          data: {
            name: role.name,
            nameEn: role.nameEn,
            description: role.description,
            isActive: role.isActive
          }
        });
      }
    }

    // Update course instructors
    for (const instructor of courseInstructors) {
      if (instructor.id.startsWith('new-')) {
        // Create new course instructor
        await prisma.courseInstructor.create({
          data: {
            academicYearId: instructor.academicYearId,
            semesterId: instructor.semesterId,
            courseId: instructor.courseId || null,
            instructorId: instructor.instructorId,
            roleId: instructor.roleId,
            isActive: instructor.isActive,
            createdBy: instructor.createdBy || instructor.instructorId
          }
        });
      } else {
        // Update existing course instructor
        await prisma.courseInstructor.update({
          where: { id: instructor.id },
          data: {
            academicYearId: instructor.academicYearId,
            semesterId: instructor.semesterId,
            courseId: instructor.courseId || null,
            instructorId: instructor.instructorId,
            roleId: instructor.roleId,
            isActive: instructor.isActive
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving educator data:', error);
    return NextResponse.json(
      { error: 'Failed to save educator data' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
