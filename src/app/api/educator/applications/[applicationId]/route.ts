import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 Application details API:', { applicationId, userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        major: { select: { id: true, nameTh: true, nameEn: true } },
        department: { select: { id: true, nameTh: true, nameEn: true } },
        faculty: { select: { id: true, nameTh: true, nameEn: true } }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
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
                       userRoles.includes('visitor');
    
    console.log('🔍 User roles check:', { userRoles, isEducator });
    
    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // ดึงข้อมูล application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            major: {
              select: {
                id: true,
                nameTh: true,
                nameEn: true
              }
            },
            department: {
              select: {
                id: true,
                nameTh: true,
                nameEn: true
              }
            },
            faculty: {
              select: {
                id: true,
                nameTh: true,
                nameEn: true
              }
            }
          }
        },
        internship: {
          include: {
        company: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            address: true,
            phone: true,
            email: true,
            website: true
          }
        }
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    // ปรับให้บทบาท educator ที่ได้รับอนุญาต (courseInstructor, committee, visitor)
    // สามารถดูรายละเอียดใบสมัครได้เหมือนหน้า list เพื่อความสอดคล้องของ UX
    const allowedEducatorRoles = ['courseInstructor', 'committee', 'visitor'];
    const hasAllowedRole = Array.isArray(userRoles) && userRoles.some((r: string) => allowedEducatorRoles.includes(r));

    if (!hasAllowedRole) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        studentId: application.studentId,
        status: application.status,
        dateApplied: application.dateApplied.toISOString(),
        student: application.student,
        internship: application.internship,
        courseInstructor: application.courseInstructor
      },
      user: {
        id: user.id,
        name: user.name,
        role: userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา') ? 'อาจารย์ประจำวิชา' :
              userRoles.includes('committee') || userRoles.includes('กรรมการ') ? 'กรรมการ' : 'ไม่ระบุ'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching application:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body = await request.json();
    const { status, feedback, isDraft } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Only validate status if it's not a draft submission
    if (!isDraft && (!status || !['approved', 'rejected'].includes(status))) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        major: { select: { id: true, nameTh: true, nameEn: true } },
        department: { select: { id: true, nameTh: true, nameEn: true } },
        faculty: { select: { id: true, nameTh: true, nameEn: true } }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
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
                       userRoles.includes('visitor');
    
    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

    // อัปเดตสถานะ application
    const updateData: any = {
      feedback: feedback || null
    };

    // ถ้าไม่ใช่แบบร่าง ให้อัปเดตสถานะ
    if (!isDraft) {
      updateData.status = status as any;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            id: true
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: isDraft ? 'Draft saved successfully' : `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}