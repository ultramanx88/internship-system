import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

// Schema for creating educator role assignment
const createAssignmentSchema = z.object({
  educatorId: z.string().min(1, 'ต้องระบุ educator ID'),
  academicYearId: z.string().min(1, 'ต้องระบุปีการศึกษา'),
  semesterId: z.string().min(1, 'ต้องระบุภาคเรียน'),
  roles: z.array(z.enum(['courseInstructor', 'supervisor', 'committee', 'visitor'])).min(1, 'ต้องระบุบทบาทอย่างน้อย 1 บทบาท'),
  isActive: z.boolean().default(true),
  notes: z.string().optional()
});

// Schema for updating educator role assignment
const updateAssignmentSchema = z.object({
  roles: z.array(z.enum(['courseInstructor', 'supervisor', 'committee', 'visitor'])).min(1, 'ต้องระบุบทบาทอย่างน้อย 1 บทบาท'),
  isActive: z.boolean().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const semesterId = searchParams.get('semesterId');
    const educatorId = searchParams.get('educatorId');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (academicYearId) whereClause.academicYearId = academicYearId;
    if (semesterId) whereClause.semesterId = semesterId;
    if (educatorId) whereClause.educatorId = educatorId;
    if (role) whereClause.roles = { contains: `"${role}"` };
    if (isActive !== null) whereClause.isActive = isActive === 'true';

    // Get assignments with related data
    const [assignments, total] = await Promise.all([
      prisma.educatorRoleAssignment.findMany({
        where: whereClause,
        include: {
          educator: {
            select: {
              id: true,
              name: true,
              email: true,
              t_name: true,
              t_surname: true,
              e_name: true,
              e_surname: true
            }
          },
          academicYear: {
            select: {
              id: true,
              year: true,
              name: true
            }
          },
          semester: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          }
        },
        orderBy: [
          { academicYear: { year: 'desc' } },
          { semester: { startDate: 'desc' } },
          { educator: { name: 'asc' } }
        ],
        skip: offset,
        take: limit
      }),
      prisma.educatorRoleAssignment.count({ where: whereClause })
    ]);

    // Parse roles from JSON string
    // Parse roles safely (array in DB string or already array)
    const assignmentsWithParsedRoles = assignments.map((assignment: any) => {
      let parsed: string[] = [];
      try {
        if (Array.isArray(assignment.roles)) parsed = assignment.roles;
        else if (typeof assignment.roles === 'string') parsed = JSON.parse(assignment.roles || '[]');
      } catch {}
      return { ...assignment, roles: parsed };
    });

    return NextResponse.json({
      success: true,
      assignments: assignmentsWithParsedRoles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching educator role assignments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลการกำหนดบทบาทได้',
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
    const result = createAssignmentSchema.safeParse(body);

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

    const { educatorId, academicYearId, semesterId, roles, isActive, notes } = result.data;

    // Check if educator exists
    const educator = await prisma.user.findUnique({
      where: { id: educatorId },
      select: { id: true, name: true, roles: true }
    });

    if (!educator) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ educator ที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if educator has educator role
    const userRoles = JSON.parse(educator.roles || '[]');
    if (!userRoles.includes('educator') && !userRoles.some((role: string) => 
      ['courseInstructor', 'supervisor', 'committee', 'visitor'].includes(role)
    )) {
      return NextResponse.json(
        { success: false, error: 'ผู้ใช้ที่ระบุไม่ใช่ educator' },
        { status: 400 }
      );
    }

    // Check if assignment already exists for this educator, academic year, and semester
    const existingAssignment = await prisma.educatorRoleAssignment.findFirst({
      where: {
        educatorId,
        academicYearId,
        semesterId
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'มีการกำหนดบทบาทสำหรับ educator นี้ในเทอม/ปีการศึกษานี้แล้ว' },
        { status: 409 }
      );
    }

    // Create new assignment
    const assignment = await prisma.educatorRoleAssignment.create({
      data: {
        educatorId,
        academicYearId,
        semesterId,
        roles: JSON.stringify(roles),
        isActive,
        notes
      },
      include: {
        educator: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true
          }
        },
        academicYear: {
          select: {
            id: true,
            year: true,
            name: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        roles: JSON.parse(assignment.roles)
      },
      message: 'กำหนดบทบาทให้ educator สำเร็จ'
    });

  } catch (error) {
    console.error('Error creating educator role assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถกำหนดบทบาทได้',
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
    // Removed authentication check for internal admin functions

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุ ID ที่ต้องการลบ' },
        { status: 400 }
      );
    }

    // Delete assignments
    const deleteResult = await prisma.educatorRoleAssignment.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      message: `ลบการกำหนดบทบาท ${deleteResult.count} รายการสำเร็จ`
    });

  } catch (error) {
    console.error('Error deleting educator role assignments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถลบการกำหนดบทบาทได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
