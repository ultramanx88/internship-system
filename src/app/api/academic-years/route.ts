import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

const createAcademicYearSchema = z.object({
  year: z.number().min(2020).max(2030),
  name: z.string().min(1, 'ต้องระบุชื่อปีการศึกษา'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(false)
});

const updateAcademicYearSchema = z.object({
  year: z.number().min(2020).max(2030).optional(),
  name: z.string().min(1, 'ต้องระบุชื่อปีการศึกษา').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    console.log('Fetching academic years with whereClause:', whereClause);

    // Get academic years with related data
    const academicYears = await prisma.academicYear.findMany({
      where: whereClause,
      include: {
        semesters: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isActive: true
          }
        },
        _count: {
          select: {
            semesters: true,
            roleAssignments: true
          }
        }
      },
      orderBy: { year: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.academicYear.count({ where: whereClause });

    console.log('Found academic years:', academicYears.length);

    return NextResponse.json({
      success: true,
      academicYears,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลปีการศึกษาได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    const body = await request.json();
    const result = createAcademicYearSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: result.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { year, name, startDate, endDate, isActive } = result.data;

    // Check if year already exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { year }
    });

    if (existingYear) {
      return NextResponse.json(
        { success: false, error: 'ปีการศึกษานี้มีอยู่แล้ว' },
        { status: 409 }
      );
    }

    // If this is set as active, deactivate other years
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Create new academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        year,
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      },
      include: {
        semesters: true,
        _count: {
          select: {
            semesters: true,
            roleAssignments: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      academicYear,
      message: 'สร้างปีการศึกษาใหม่สำเร็จ'
    });

  } catch (error) {
    console.error('Error creating academic year:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถสร้างปีการศึกษาได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุ ID ที่ต้องการลบ' },
        { status: 400 }
      );
    }

    // Delete academic years
    const deleteResult = await prisma.academicYear.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      message: `ลบปีการศึกษา ${deleteResult.count} รายการสำเร็จ`
    });

  } catch (error) {
    console.error('Error deleting academic years:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถลบปีการศึกษาได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}