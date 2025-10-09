import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, userId } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
                       userRoles.includes('อาจารย์นิเทศก์') ||
                       userRoles.includes('กรรมการ');

    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่า applications มีอยู่หรือไม่ (สำหรับการมอบหมายอาจารย์นิเทศก์)
    const applications = await prisma.application.findMany({
      where: { 
        id: { in: applicationIds },
        status: 'approved' // ใช้ approved แทน pending
      },
      select: { 
        id: true, 
        status: true,
        courseInstructorId: true
      }
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'No approved applications found for supervisor assignment' },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา')) {
      const unauthorizedApps = applications.filter(app => app.courseInstructorId !== userId);
      if (unauthorizedApps.length > 0) {
        return NextResponse.json(
          { error: 'Access denied to some applications' },
          { status: 403 }
        );
      }
    }

    // ตรวจสอบว่า applications ที่เลือกมีอยู่จริง
    const foundApplications = applications.length;
    
    // มอบหมายอาจารย์นิเทศก์ (ใช้ supervisor_test_001 เป็น default)
    const supervisorId = 'supervisor_test_001';
    
    // อัปเดต applications (ไม่มี supervisorId field แล้ว)
    console.log('🔍 Updating applications:', { applicationIds });
    
    const updatedApplications = await prisma.application.updateMany({
      where: { 
        id: { in: applicationIds },
        status: 'approved'
      },
      data: {
        // ไม่มี supervisorId field แล้ว
      }
    });
    
    console.log('✅ Update result:', updatedApplications);

    return NextResponse.json({
      success: true,
      message: `Ready for supervisor assignment: ${foundApplications} applications`,
      count: foundApplications
    });

  } catch (error) {
    console.error('Error bulk approving applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
