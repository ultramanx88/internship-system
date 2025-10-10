import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET - ดึงข้อมูลการฝึกงานของนักศึกษา
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(['student'])(request);
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'ต้องระบุรหัสคำขอฝึกงาน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: user.id
      },
      include: {
        internship: {
          include: {
            company: true
          }
        },
        weeklyReports: {
          orderBy: {
            weekNumber: 'asc'
          }
        },
        internshipDocuments: {
          where: {
            type: 'student_introduction_letter'
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือไม่มีสิทธิ์เข้าถึง' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Error fetching student internship data:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลได้' },
      { status: 500 }
    );
  }
}

// POST - บันทึกวันเริ่มฝึกงาน
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['student'])(request);
    const { applicationId, startDate } = await request.json();

    if (!applicationId || !startDate) {
      return NextResponse.json(
        { error: 'ต้องระบุรหัสคำขอฝึกงานและวันเริ่มฝึกงาน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์และสถานะ
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: user.id,
        status: 'company_accepted'
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือสถานะไม่ถูกต้อง' },
        { status: 404 }
      );
    }

    // อัปเดตสถานะและวันเริ่มฝึกงาน
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'internship_started',
        preferredStartDate: new Date(startDate)
      },
      include: {
        internship: {
          include: {
            company: true
          }
        }
      }
    });

    // ส่งการแจ้งเตือนไปยังอาจารย์นิเทศก์
    if (application.supervisorId) {
      await prisma.notification.create({
        data: {
          userId: application.supervisorId,
          type: 'application_status_change',
          title: 'นักศึกษาเริ่มฝึกงานแล้ว',
          message: `${user.name} ได้เริ่มฝึกงานที่ ${updatedApplication.internship.company.name} แล้ว`,
          actionUrl: `/supervisor/applications/${applicationId}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกวันเริ่มฝึกงานเรียบร้อย',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating internship start date:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกวันเริ่มฝึกงานได้' },
      { status: 500 }
    );
  }
}
