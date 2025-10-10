import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // ดึงรายงานประจำสัปดาห์
    const weeklyReports = await prisma.weeklyReport.findMany({
      where: {
        applicationId
      },
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    const body = await request.json();
    const { applicationId, weekNumber, reportDate, content, attachments } = body;

    if (!applicationId || !weekNumber || !reportDate || !content) {
      return NextResponse.json(
        { error: 'Application ID, week number, report date, and content are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นนักศึกษาที่มีสิทธิ์ส่งรายงาน
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { studentId: true }
    });

    if (!application || application.studentId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to submit report for this application' },
        { status: 403 }
      );
    }

    // สร้างรายงานประจำสัปดาห์
    const weeklyReport = await prisma.weeklyReport.create({
      data: {
        applicationId,
        weekNumber: parseInt(weekNumber),
        reportDate: new Date(reportDate),
        content,
        attachments: attachments || []
      }
    });

    return NextResponse.json({
      success: true,
      weeklyReport,
      message: 'Weekly report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating weekly report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
