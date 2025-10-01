import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRelations = searchParams.get('include') === 'true';

    const faculties = await prisma.faculty.findMany({
      where: {
        isActive: true,
      },
      include: includeRelations ? {
        departments: {
          where: { isActive: true },
          include: {
            curriculums: {
              where: { isActive: true },
              include: {
                majors: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      } : {
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
      orderBy: {
        nameTh: 'asc',
      },
    });

    return NextResponse.json({
      faculties,
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameTh, nameEn, code } = body;

    if (!nameTh) {
      return NextResponse.json(
        { error: 'ชื่อคณะ (ภาษาไทย) เป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if faculty with same name already exists
    const existingFaculty = await prisma.faculty.findFirst({
      where: { nameTh },
    });

    if (existingFaculty) {
      return NextResponse.json(
        { error: 'คณะนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.create({
      data: {
        nameTh,
        nameEn,
        code,
      },
      include: {
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}