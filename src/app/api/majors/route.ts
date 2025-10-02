import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curriculumId = searchParams.get('curriculumId');

    const where: any = {
      isActive: true,
    };

    if (curriculumId) {
      where.curriculumId = curriculumId;
    }

    const majors = await prisma.major.findMany({
      where,
      include: {
        curriculum: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        nameTh: 'asc',
      },
    });

    return NextResponse.json({
      majors,
    });
  } catch (error) {
    console.error('Error fetching majors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameTh, nameEn, curriculumId, area } = body;

    if (!nameTh || !curriculumId) {
      return NextResponse.json(
        { error: 'ชื่อสาขาวิชาและหลักสูตรเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if curriculum exists
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: 'ไม่พบหลักสูตรที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if major with same name already exists in this curriculum
    const existingMajor = await prisma.major.findFirst({
      where: {
        nameTh,
        curriculumId,
      },
    });

    if (existingMajor) {
      return NextResponse.json(
        { error: 'สาขาวิชานี้มีอยู่ในหลักสูตรแล้ว' },
        { status: 400 }
      );
    }

    const major = await prisma.major.create({
      data: {
        nameTh,
        nameEn,
        curriculumId,
        area,
      },
      include: {
        curriculum: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json(major, { status: 201 });
  } catch (error) {
    console.error('Error creating major:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}