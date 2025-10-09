import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params;
    const { committeeIds, assignedBy } = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!committeeIds || !Array.isArray(committeeIds) || committeeIds.length === 0) {
      return NextResponse.json({ error: 'Committee IDs are required' }, { status: 400 });
    }

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

    // ตรวจสอบว่า application มีอยู่
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { 
        id: true, 
        status: true,
        student: {
          select: {
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

    // ลบการมอบหมายเก่า
    await prisma.applicationCommittee.deleteMany({
      where: { applicationId: applicationId }
    });

    // เพิ่มการมอบหมายใหม่
    const assignments = [];
    for (const committeeId of committeeIds) {
      const assignment = await prisma.applicationCommittee.create({
        data: {
          applicationId: applicationId,
          committeeId: committeeId,
          assignedBy: assignedBy || userId,
          isActive: true
        }
      });
      assignments.push(assignment);
    }

    // ดึงข้อมูลที่อัปเดตแล้ว
    const updatedApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        },
        committees: {
          include: {
            committee: {
              select: {
                id: true,
                name: true,
                academicYear: true,
                semester: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `มอบหมายกรรมการให้กับ ${application.student.name} เรียบร้อยแล้ว`,
      application: updatedApplication,
      assignments: assignments
    });

  } catch (error) {
    console.error('Error assigning committee:', error);
    return NextResponse.json(
      { error: 'Failed to assign committee', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        committees: {
          include: {
            committee: {
              select: {
                id: true,
                name: true,
                academicYear: true,
                semester: true,
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      committees: application.committees
    });

  } catch (error) {
    console.error('Error fetching application committees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application committees', details: (error as Error).message },
      { status: 500 }
    );
  }
}
