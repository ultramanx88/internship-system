import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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
                       userRoles.includes('อาจารย์นิเทศ') ||
                       userRoles.includes('กรรมการ');

    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ดึงรายชื่ออาจารย์นิเทศ (อาจารย์ที่มี role อาจารย์นิเทศ)
    const supervisors = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'อาจารย์นิเทศ'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: {
          select: {
            nameTh: true,
            nameEn: true
          }
        },
        faculty: {
          select: {
            nameTh: true,
            nameEn: true
          }
        }
      }
    });

    // แปลงข้อมูลให้ตรงกับ interface
    const formattedSupervisors = supervisors.map(supervisor => ({
      id: supervisor.id,
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone || 'ไม่ระบุ',
      department: supervisor.department?.nameTh || 'ไม่ระบุ',
      faculty: supervisor.faculty?.nameTh || 'ไม่ระบุ'
    }));

    return NextResponse.json({
      success: true,
      supervisors: formattedSupervisors
    });

  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
