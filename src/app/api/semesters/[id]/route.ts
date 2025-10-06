import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

const updateSemesterSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อภาคเรียน').optional(),
  academicYearId: z.string().min(1, 'ต้องระบุปีการศึกษา').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const semesterId = params.id;

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
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

    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบภาคเรียนที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      semester
    });

  } catch (error) {
    console.error('Error fetching semester:', error);
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const semesterId = params.id;
    const body = await request.json();
    const result = updateSemesterSchema.safeParse(body);

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

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });

    if (!existingSemester) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบภาคเรียนที่ระบุ' },
        { status: 404 }
      );
    }

    // If academicYearId is being changed, check if new academic year exists
    if (academicYearId && academicYearId !== existingSemester.academicYearId) {
      const academicYear = await prisma.academicYear.findUnique({
        where: { id: academicYearId }
      });

      if (!academicYear) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบปีการศึกษาที่ระบุ' },
          { status: 404 }
        );
      }

      // Check if semester with same name already exists in the new academic year
      const duplicateSemester = await prisma.semester.findFirst({
        where: {
          name: name || existingSemester.name,
          academicYearId,
          id: { not: semesterId }
        }
      });

      if (duplicateSemester) {
        return NextResponse.json(
          { success: false, error: 'ภาคเรียนนี้มีอยู่ในปีการศึกษานี้แล้ว' },
          { status: 409 }
        );
      }
    }

    // If this is set as active, deactivate other semesters in the same academic year
    if (isActive) {
      const targetAcademicYearId = academicYearId || existingSemester.academicYearId;
      await prisma.semester.updateMany({
        where: { 
          academicYearId: targetAcademicYearId,
          isActive: true,
          id: { not: semesterId }
        },
        data: { isActive: false }
      });
    }

    // Update semester
    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: {
        name: name || existingSemester.name,
        academicYearId: academicYearId || existingSemester.academicYearId,
        startDate: startDate ? new Date(startDate) : existingSemester.startDate,
        endDate: endDate ? new Date(endDate) : existingSemester.endDate,
        isActive: isActive !== undefined ? isActive : existingSemester.isActive
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
      semester: updatedSemester,
      message: 'อัปเดตภาคเรียนสำเร็จ'
    });

  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถอัปเดตภาคเรียนได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const semesterId = params.id;

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });

    if (!existingSemester) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบภาคเรียนที่ระบุ' },
        { status: 404 }
      );
    }

    // Delete semester
    await prisma.semester.delete({
      where: { id: semesterId }
    });

    return NextResponse.json({
      success: true,
      message: 'ลบภาคเรียนสำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting semester:', error);
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
