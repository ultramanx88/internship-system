import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      code, 
      name, 
      nameEn, 
      description, 
      credits, 
      categoryId, 
      facultyId, 
      departmentId, 
      curriculumId, 
      majorId,
      isActive 
    } = body;

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        code,
        name,
        nameEn,
        description,
        credits,
        categoryId,
        facultyId,
        departmentId,
        curriculumId,
        majorId,
        isActive,
        updatedAt: new Date()
      },
      include: {
        category: true,
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.course.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Course deactivated successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
