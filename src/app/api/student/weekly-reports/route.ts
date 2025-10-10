import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET - ดึงรายงานประจำสัปดาห์ของนักศึกษา
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
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือไม่มีสิทธิ์เข้าถึง' },
        { status: 404 }
      );
    }

    // ดึงรายงานประจำสัปดาห์
    const weeklyReports = await prisma.weeklyReport.findMany({
      where: { applicationId },
      orderBy: {
        weekNumber: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      weeklyReports
    });

  } catch (error) {
    console.error('Error fetching weekly reports:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงรายงานประจำสัปดาห์ได้' },
      { status: 500 }
    );
  }
}

// POST - ส่งรายงานประจำสัปดาห์
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['student'])(request);
    const { applicationId, weekNumber, reportDate, content, attachments = [] } = await request.json();

    if (!applicationId || !weekNumber || !reportDate || !content) {
      return NextResponse.json(
        { error: 'ต้องระบุข้อมูลครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์และสถานะ
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: user.id,
        status: {
          in: ['internship_started', 'internship_ongoing']
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือสถานะไม่ถูกต้อง' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีรายงานสัปดาห์นี้อยู่แล้วหรือไม่
    const existingReport = await prisma.weeklyReport.findUnique({
      where: {
        applicationId_weekNumber: {
          applicationId,
          weekNumber: parseInt(weekNumber)
        }
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'มีรายงานสัปดาห์นี้อยู่แล้ว' },
        { status: 400 }
      );
    }

    // สร้างรายงานประจำสัปดาห์
    const weeklyReport = await prisma.weeklyReport.create({
      data: {
        applicationId,
        weekNumber: parseInt(weekNumber),
        reportDate: new Date(reportDate),
        content,
        attachments
      }
    });

    // อัปเดตสถานะเป็น internship_ongoing หากยังไม่เคยอัปเดต
    if (application.status === 'internship_started') {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: 'internship_ongoing'
        }
      });
    }

    // ส่งการแจ้งเตือนไปยังอาจารย์นิเทศก์
    if (application.supervisorId) {
      await prisma.notification.create({
        data: {
          userId: application.supervisorId,
          type: 'report_due',
          title: 'รายงานประจำสัปดาห์ใหม่',
          message: `${user.name} ได้ส่งรายงานประจำสัปดาห์ที่ ${weekNumber} แล้ว`,
          actionUrl: `/supervisor/applications/${applicationId}/reports`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งรายงานประจำสัปดาห์เรียบร้อย',
      weeklyReport
    });

  } catch (error) {
    console.error('Error submitting weekly report:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถส่งรายงานประจำสัปดาห์ได้' },
      { status: 500 }
    );
  }
}

// PUT - แก้ไขรายงานประจำสัปดาห์
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(['student'])(request);
    const { reportId, content, attachments } = await request.json();

    if (!reportId || !content) {
      return NextResponse.json(
        { error: 'ต้องระบุข้อมูลครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const report = await prisma.weeklyReport.findFirst({
      where: {
        id: reportId,
        application: {
          studentId: user.id
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'ไม่พบรายงานหรือไม่มีสิทธิ์แก้ไข' },
        { status: 404 }
      );
    }

    // อัปเดตรายงาน
    const updatedReport = await prisma.weeklyReport.update({
      where: { id: reportId },
      data: {
        content,
        attachments: attachments || report.attachments
      }
    });

    return NextResponse.json({
      success: true,
      message: 'แก้ไขรายงานประจำสัปดาห์เรียบร้อย',
      weeklyReport: updatedReport
    });

  } catch (error) {
    console.error('Error updating weekly report:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถแก้ไขรายงานประจำสัปดาห์ได้' },
      { status: 500 }
    );
  }
}
