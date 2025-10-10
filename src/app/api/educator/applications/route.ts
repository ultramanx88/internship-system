import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // internship type filter (internship | co_op)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้และตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
    if (!user.roles || !user.roles.some(role => ['courseInstructor', 'committee', 'admin'].includes(role))) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ดึงข้อมูล applications ตาม role
    let applications = [];

    if (user.roles.includes('courseInstructor')) {
      // อาจารย์ประจำวิชาเห็น applications ที่ถูกกำหนดให้ตน
      applications = await prisma.application.findMany({
        where: {
          courseInstructorId: userId,
          ...(status && { status: status as any })
        },
        select: {
          id: true,
          status: true,
          documentStatus: true,
          dateApplied: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              phone: true,
              skills: true,
              statement: true,
              profileImage: true,
              major: { select: { id: true, nameTh: true, nameEn: true } },
              department: { select: { id: true, nameTh: true, nameEn: true } },
              faculty: { select: { id: true, nameTh: true, nameEn: true } }
            }
          }
        },
        orderBy: {
          dateApplied: 'desc'
        }
      });
    } else {
      // กรรมการเห็น applications ทั้งหมด
      applications = await prisma.application.findMany({
        where: {
          ...(status && { status: status as any })
        },
        select: {
          id: true,
          status: true,
          documentStatus: true,
          dateApplied: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              phone: true,
              skills: true,
              statement: true,
              profileImage: true,
              major: { select: { id: true, nameTh: true, nameEn: true } },
              department: { select: { id: true, nameTh: true, nameEn: true } },
              faculty: { select: { id: true, nameTh: true, nameEn: true } }
            }
          }
        },
        orderBy: {
          dateApplied: 'desc'
        }
      });
    }

    return NextResponse.json({
      applications,
      user: {
        id: user.id,
        name: user.name,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
