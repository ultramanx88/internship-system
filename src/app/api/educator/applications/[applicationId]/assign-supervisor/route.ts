import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    const body = await request.json();
    const { supervisorId, userId } = body;

    if (!supervisorId || !userId) {
      return NextResponse.json(
        { error: 'Supervisor ID and User ID are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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
                       userRoles.includes('อาจารย์นิเทศ') ||
                       userRoles.includes('กรรมการ');

    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่า application มีอยู่หรือไม่
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { 
        id: true, 
        status: true,
        courseInstructorId: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา')) {
      if (application.courseInstructorId !== userId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // ตรวจสอบว่าอาจารย์นิเทศมีอยู่หรือไม่
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId },
      select: { 
        id: true, 
        roles: true,
        name: true
      }
    });

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็นอาจารย์นิเทศหรือไม่
    let supervisorRoles = supervisor.roles;
    if (typeof supervisorRoles === 'string') {
      try {
        supervisorRoles = JSON.parse(supervisorRoles);
      } catch (e) {
        supervisorRoles = [supervisorRoles];
      }
    }

    if (!supervisorRoles.includes('อาจารย์นิเทศ')) {
      return NextResponse.json(
        { error: 'Selected user is not a supervisor' },
        { status: 400 }
      );
    }

    // อัปเดต application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'approved',
        // เพิ่มฟิลด์สำหรับอาจารย์นิเทศ (ถ้ามีใน schema)
        // supervisorId: supervisorId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Supervisor assigned successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error assigning supervisor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
