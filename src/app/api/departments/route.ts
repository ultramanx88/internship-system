import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');
    const includeRelations = searchParams.get('include') === 'true';

    const where: any = {
      isActive: true,
    };

    if (facultyId) {
      where.facultyId = facultyId;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        faculty: true,
        ...(includeRelations && {
          curriculums: {
            where: { isActive: true },
            include: {
              majors: {
                where: { isActive: true },
              },
            },
          },
        }),
        _count: {
          select: {
            curriculums: true,
            users: true,
          },
        },
      },
      orderBy: {
        nameTh: 'asc',
      },
    });

    return NextResponse.json({
      departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameTh, nameEn, code, facultyId } = body;

    if (!nameTh || !facultyId) {
      return NextResponse.json(
        { error: 'ชื่อสาขาและคณะเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return NextResponse.json(
        { error: 'ไม่พบคณะที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if department with same name already exists in this faculty
    const existingDepartment = await prisma.department.findFirst({
      where: {
        nameTh,
        facultyId,
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'สาขานี้มีอยู่ในคณะแล้ว' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        nameTh,
        nameEn,
        code,
        facultyId,
      },
      include: {
        faculty: true,
        _count: {
          select: {
            curriculums: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}