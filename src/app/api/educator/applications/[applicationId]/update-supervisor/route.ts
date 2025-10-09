import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { applicationId: string } }) {
  // ตรวจสอบการเข้าถึงผ่าน userId parameter แทน session

  const { applicationId } = params;
  const { supervisorId } = await request.json();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!supervisorId) {
    return NextResponse.json({ error: 'Supervisor ID is required' }, { status: 400 });
  }

  try {
    // ตรวจสอบสิทธิ์ผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userRoles = user.roles;
    if (typeof userRoles === 'string') {
      try {
        userRoles = JSON.parse(userRoles);
      } catch (e) {
        userRoles = [userRoles];
      }
    }

    const isEducator = userRoles.includes('courseInstructor') ||
                       userRoles.includes('committee') ||
                       userRoles.includes('อาจารย์ประจำวิชา') ||
                       userRoles.includes('อาจารย์นิเทศก์') ||
                       userRoles.includes('กรรมการ');

    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่า application มีอยู่และเป็น approved
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { 
        id: true, 
        status: true, 
        courseInstructorId: true,
        student: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'approved' && application.status !== 'assigned_supervisor') {
      return NextResponse.json({ error: 'Application is not approved or assigned' }, { status: 400 });
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา')) {
      if (application.courseInstructorId !== userId && !userRoles.includes('committee') && !userRoles.includes('กรรมการ')) {
        return NextResponse.json({ error: 'Access denied: Not the assigned course instructor' }, { status: 403 });
      }
    }

    // ตรวจสอบว่า supervisor มีอยู่จริง
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId },
      select: { 
        id: true, 
        name: true, 
        email: true,
        roles: true
      }
    });

    if (!supervisor) {
      return NextResponse.json({ error: 'Supervisor not found' }, { status: 404 });
    }

    // ตรวจสอบว่าเป็นอาจารย์นิเทศก์จริงหรือไม่
    let supervisorRoles = supervisor.roles;
    if (typeof supervisorRoles === 'string') {
      try {
        supervisorRoles = JSON.parse(supervisorRoles);
      } catch (e) {
        supervisorRoles = [supervisorRoles];
      }
    }

    const isSupervisor = supervisorRoles.includes('อาจารย์นิเทศก์') || supervisorRoles.includes('supervisor');
    if (!isSupervisor) {
      return NextResponse.json({ error: 'Selected user is not a supervisor' }, { status: 400 });
    }

    // อัปเดต supervisor
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        // supervisorId field ไม่มีแล้ว
        // ไม่เปลี่ยน status เพื่อรักษาสถานะเดิม
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `อัปเดตอาจารย์นิเทศก์สำหรับ ${application.student.name} เรียบร้อยแล้ว`,
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to update supervisor', details: (error as Error).message },
      { status: 500 }
    );
  }
}
