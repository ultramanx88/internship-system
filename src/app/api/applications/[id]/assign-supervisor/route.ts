import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { supervisorId } = body;

    if (!supervisorId) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุอาจารย์นิเทศก์' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าอาจารย์นิเทศก์มี role visitor
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId },
      select: { id: true, name: true, roles: true }
    });

    if (!supervisor || !supervisor.roles.includes('visitor')) {
      return NextResponse.json(
        { success: false, error: 'ผู้ใช้ที่เลือกไม่ใช่อาจารย์นิเทศก์' },
        { status: 400 }
      );
    }

    // อัปเดต Application
    const updatedApplication = await prisma.application.update({
      where: { id: (await params).id },
      data: {
        supervisorId: supervisorId,
        supervisorAssigned: true,
        supervisorAssignedAt: new Date(),
        status: 'course_instructor_approved'
      },
      select: { id: true, studentId: true, status: true, supervisorId: true, supervisorAssigned: true, supervisorAssignedAt: true }
    });

    return NextResponse.json({
      success: true,
      message: 'มอบหมายอาจารย์นิเทศก์เรียบร้อย',
      application: updatedApplication,
      supervisor: supervisor
    });
  } catch (error) {
    console.error('Assign Supervisor API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถมอบหมายอาจารย์นิเทศก์ได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
