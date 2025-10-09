import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [educatorRoles, courseInstructors] = await Promise.all([
      prisma.educatorRole.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.courseInstructor.findMany({
        include: {
          course: true,
          user: true
        },
        orderBy: [
          { course: { code: 'asc' } },
          { user: { name: 'asc' } }
        ]
      })
    ]);

    return NextResponse.json({
      educatorRoles,
      courseInstructors
    });
  } catch (error) {
    console.error('Error fetching educator management data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch educator management data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
            courseId: instructor.courseId,
            userId: instructor.userId,
            role: instructor.role,
            isActive: instructor.isActive
          }
        });
      } else {
        // Update existing course instructor
        await prisma.courseInstructor.update({
          where: { id: instructor.id },
          data: {
            courseId: instructor.courseId,
            userId: instructor.userId,
            role: instructor.role,
            isActive: instructor.isActive
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving educator management data:', error);
    return NextResponse.json(
      { error: 'Failed to save educator management data' },
      { status: 500 }
    );
  }
}
