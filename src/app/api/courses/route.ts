import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');
    const departmentId = searchParams.get('departmentId');
    const curriculumId = searchParams.get('curriculumId');
    const majorId = searchParams.get('majorId');
    const categoryId = searchParams.get('categoryId');

    const where: any = { isActive: true };
    
    if (facultyId) where.facultyId = facultyId;
    if (departmentId) where.departmentId = departmentId;
    if (curriculumId) where.curriculumId = curriculumId;
    if (majorId) where.majorId = majorId;
    if (categoryId) where.categoryId = categoryId;

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses (returning empty list to keep UI functional):', error);
    // Fallback: return empty list to avoid breaking UI when model/table is not present yet
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
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
      majorId 
    } = body;

    const course = await prisma.course.create({
      data: {
        id: `course_${Date.now()}`,
        code,
        name,
        nameEn,
        description,
        credits: credits || 3,
        categoryId,
        facultyId,
        departmentId,
        curriculumId,
        majorId,
        isActive: true
      },
      include: {
        category: true,
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
