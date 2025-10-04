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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้และตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        educatorRole: true,
        courseInstructors: {
          include: {
            supervisedStudents: {
              include: {
                application: {
                  include: {
                    student: true,
                    internship: {
                      include: {
                        company: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น educator หรือไม่
    if (!user.educatorRole) {
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
            studentId: true,
            phone: true,
            skills: true,
            statement: true,
            profileImage: true
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
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
    if (user.educatorRole.name === 'อาจารย์นิเทศ') {
      // อาจารย์นิเทศเห็นได้เฉพาะ applications ของนักศึกษาที่อยู่ในความดูแล
      const supervisedStudentIds = user.courseInstructors
        .flatMap(ci => ci.supervisedStudents)
        .map(ss => ss.studentId);

      if (!supervisedStudentIds.includes(application.studentId)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      application,
      user: {
        id: user.id,
        name: user.name,
        role: user.educatorRole.name
      }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
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
    const { status, feedback } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้และตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        educatorRole: true
      }
    });

    if (!user || !user.educatorRole) {
      return NextResponse.json(
        { error: 'User not found or not an educator' },
        { status: 404 }
      );
    }

    // อัปเดตสถานะ application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as any,
        feedback: feedback || null,
        reviewedAt: new Date(),
        reviewedBy: user.id
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
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
      application: updatedApplication,
      message: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`
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
