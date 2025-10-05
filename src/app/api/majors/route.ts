import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

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
    const { user } = authResult;

    const body = await request.json();
    
    // Sanitize input
    const sanitizedBody = sanitizeUserInput(body);
    if (!sanitizedBody.isValid) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: sanitizedBody.errors },
        { status: 400 }
      );
    }
    
    const { nameTh, nameEn, curriculumId, area } = sanitizedBody.sanitized;
    const sanitizedNameTh = sanitizeString(nameTh);
    const sanitizedNameEn = nameEn ? sanitizeString(nameEn) : null;
    const sanitizedArea = area ? sanitizeString(area) : null;

    if (!sanitizedNameTh || !curriculumId) {
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
        nameTh: sanitizedNameTh,
        nameEn: sanitizedNameEn,
        curriculumId,
        area: sanitizedArea,
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
  } finally {
    await cleanup();
  }
}