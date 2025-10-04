import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const courseInstructors = await prisma.courseInstructor.findMany({
      include: {
        instructor: true,
        role: true,
        academicYear: true,
        semester: true
      },
      orderBy: [
        { academicYear: { year: 'desc' } },
        { semester: { semester: 'asc' } },
        { courseId: 'asc' }
      ]
    });

    return NextResponse.json(courseInstructors);
  } catch (error) {
    console.error('Error fetching course instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course instructors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { academicYearId, semesterId, courseId, instructorId, roleId, createdBy } = await request.json();

    const courseInstructor = await prisma.courseInstructor.create({
      data: {
        academicYearId,
        semesterId,
        courseId: courseId || null,
        instructorId,
        roleId,
        createdBy: createdBy || instructorId
      },
      include: {
        instructor: true,
        role: true,
        academicYear: true,
        semester: true
      }
    });

    return NextResponse.json(courseInstructor);
  } catch (error) {
    console.error('Error creating course instructor:', error);
    return NextResponse.json(
      { error: 'Failed to create course instructor' },
      { status: 500 }
    );
  }
}
