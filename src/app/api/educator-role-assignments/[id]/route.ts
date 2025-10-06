import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

// Schema for updating educator role assignment
const updateAssignmentSchema = z.object({
  roles: z.array(z.enum(['courseInstructor', 'supervisor', 'committee', 'visitor'])).min(1, 'ต้องระบุบทบาทอย่างน้อย 1 บทบาท'),
  isActive: z.boolean().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const assignmentId = params.id;

    const assignment = await prisma.educatorRoleAssignment.findUnique({
      where: { id: assignmentId },
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

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบการกำหนดบทบาทที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        roles: JSON.parse(assignment.roles)
      }
    });

  } catch (error) {
    console.error('Error fetching educator role assignment:', error);
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const assignmentId = params.id;
    const body = await request.json();
    const result = updateAssignmentSchema.safeParse(body);

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

    const { roles, isActive, notes } = result.data;

    // Check if assignment exists
    const existingAssignment = await prisma.educatorRoleAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบการกำหนดบทบาทที่ระบุ' },
        { status: 404 }
      );
    }

    // Update assignment
    const updatedAssignment = await prisma.educatorRoleAssignment.update({
      where: { id: assignmentId },
      data: {
        roles: JSON.stringify(roles),
        isActive: isActive !== undefined ? isActive : existingAssignment.isActive,
        notes: notes !== undefined ? notes : existingAssignment.notes
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
        ...updatedAssignment,
        roles: JSON.parse(updatedAssignment.roles)
      },
      message: 'อัปเดตการกำหนดบทบาทสำเร็จ'
    });

  } catch (error) {
    console.error('Error updating educator role assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถอัปเดตการกำหนดบทบาทได้',
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

    const assignmentId = params.id;

    // Check if assignment exists
    const existingAssignment = await prisma.educatorRoleAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบการกำหนดบทบาทที่ระบุ' },
        { status: 404 }
      );
    }

    // Delete assignment
    await prisma.educatorRoleAssignment.delete({
      where: { id: assignmentId }
    });

    return NextResponse.json({
      success: true,
      message: 'ลบการกำหนดบทบาทสำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting educator role assignment:', error);
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
