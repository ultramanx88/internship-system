import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET - ดึงรายการนักศึกษาที่ได้รับมอบหมายให้อาจารย์นิเทศก์
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor'])(request);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'assigned';

    let whereClause: any = {
      supervisorId: user.id
    };

    // กรองตามสถานะ
    switch (action) {
      case 'assigned':
        whereClause.status = {
          in: ['company_accepted', 'internship_started', 'internship_ongoing']
        };
        break;
      case 'completed':
        whereClause.status = 'internship_completed';
        break;
      case 'all':
        // ไม่กรองสถานะ
        break;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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
        },
        weeklyReports: {
          orderBy: {
            weekNumber: 'desc'
          },
          take: 1
        },
        supervisorAppointments: {
          orderBy: {
            appointmentDate: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching supervisor applications:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลได้' },
      { status: 500 }
    );
  }
}

// POST - สร้างนัดหมายนิเทศ
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor'])(request);
    const { applicationId, appointmentDate, location, notes } = await request.json();

    if (!applicationId || !appointmentDate) {
      return NextResponse.json(
        { error: 'ต้องระบุรหัสคำขอฝึกงานและวันนัดหมาย' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        supervisorId: user.id
      },
      include: {
        student: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือไม่มีสิทธิ์เข้าถึง' },
        { status: 404 }
      );
    }

    // สร้างนัดหมายนิเทศ
    const appointment = await prisma.supervisorAppointment.create({
      data: {
        applicationId,
        supervisorId: user.id,
        appointmentDate: new Date(appointmentDate),
        location,
        notes,
        status: 'scheduled'
      }
    });

    // ส่งการแจ้งเตือนไปยังนักศึกษา
    await prisma.notification.create({
      data: {
        userId: application.studentId,
        type: 'appointment_scheduled',
        title: 'นัดหมายนิเทศใหม่',
        message: `อาจารย์นิเทศก์ได้นัดหมายนิเทศในวันที่ ${new Date(appointmentDate).toLocaleDateString('th-TH')}`,
        actionUrl: `/student/applications/${applicationId}/appointments`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างนัดหมายนิเทศเรียบร้อย',
      appointment
    });

  } catch (error) {
    console.error('Error creating supervisor appointment:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างนัดหมายนิเทศได้' },
      { status: 500 }
    );
  }
}