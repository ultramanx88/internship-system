import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const includeRelations = searchParams.get('include') === 'true';

    const where: any = {
      isActive: true,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const curriculums = await prisma.curriculum.findMany({
      where,
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        ...(includeRelations && {
          majors: {
            where: { isActive: true },
          },
        }),
        _count: {
          select: {
            majors: true,
            users: true,
          },
        },
      },
      orderBy: {
        nameTh: 'asc',
      },
    });

    return NextResponse.json({
      curriculums,
    });
  } catch (error) {
    console.error('Error fetching curriculums:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameTh, nameEn, code, degree, departmentId } = body;

    if (!nameTh || !departmentId) {
      return NextResponse.json(
        { error: 'ชื่อหลักสูตรและภาควิชาเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'ไม่พบภาควิชาที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if curriculum with same name already exists in this department
    const existingCurriculum = await prisma.curriculum.findFirst({
      where: {
        nameTh,
        departmentId,
      },
    });

    if (existingCurriculum) {
      return NextResponse.json(
        { error: 'หลักสูตรนี้มีอยู่ในภาควิชาแล้ว' },
        { status: 400 }
      );
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        nameTh,
        nameEn,
        code,
        degree,
        departmentId,
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        _count: {
          select: {
            majors: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(curriculum, { status: 201 });
  } catch (error) {
    console.error('Error creating curriculum:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}