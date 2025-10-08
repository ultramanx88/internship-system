import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

const createSemesterSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อภาคเรียน'),
  academicYearId: z.string().min(1, 'ต้องระบุปีการศึกษา'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(false)
});

const updateSemesterSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อภาคเรียน').optional(),
  academicYearId: z.string().min(1, 'ต้องระบุปีการศึกษา').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (academicYearId) {
      whereClause.academicYearId = academicYearId;
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    // Get semesters with related data
    const [semesters, total] = await Promise.all([
      prisma.semester.findMany({
        where: whereClause,
        include: {
          academicYear: {
            select: {
              id: true,
              year: true,
              name: true,
              isActive: true
            }
          },
          _count: {
            select: {
              roleAssignments: true
            }
          }
        },
        orderBy: [
          { academicYear: { year: 'desc' } },
          { startDate: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.semester.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      semesters,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลภาคเรียนได้',
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
    // Removed authentication check for internal admin functions

    const body = await request.json();
    const result = createSemesterSchema.safeParse(body);

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

    const { name, academicYearId, startDate, endDate, isActive } = result.data;

    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    });

    if (!academicYear) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบปีการศึกษาที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if semester with same name already exists in this academic year
    const existingSemester = await prisma.semester.findFirst({
      where: {
        name,
        academicYearId
      }
    });

    if (existingSemester) {
      return NextResponse.json(
        { success: false, error: 'ภาคเรียนนี้มีอยู่ในปีการศึกษานี้แล้ว' },
        { status: 409 }
      );
    }

    // If this is set as active, deactivate other semesters in the same academic year
    if (isActive) {
      await prisma.semester.updateMany({
        where: { 
          academicYearId,
          isActive: true 
        },
        data: { isActive: false }
      });
    }

    // Create new semester
    const semester = await prisma.semester.create({
      data: {
        name,
        academicYearId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      },
      include: {
        academicYear: {
          select: {
            id: true,
            year: true,
            name: true,
            isActive: true
          }
        },
        _count: {
          select: {
            roleAssignments: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      semester,
      message: 'สร้างภาคเรียนใหม่สำเร็จ'
    });

  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถสร้างภาคเรียนได้',
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

    // Delete semesters
    const deleteResult = await prisma.semester.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      message: `ลบภาคเรียน ${deleteResult.count} รายการสำเร็จ`
    });

  } catch (error) {
    console.error('Error deleting semesters:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถลบภาคเรียนได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}