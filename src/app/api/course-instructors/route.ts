import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const courseInstructors = await prisma.courseInstructor.findMany({
      include: {
        course: true,
        user: true
      },
      orderBy: [
        { course: { code: 'asc' } },
        { user: { name: 'asc' } }
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
    const { courseId, userId, role } = await request.json();

    const courseInstructor = await prisma.courseInstructor.create({
      data: {
        courseId,
        userId,
        role: role || 'instructor'
      },
      include: {
        course: true,
        user: true
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
