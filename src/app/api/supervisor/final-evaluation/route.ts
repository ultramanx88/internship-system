import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET - ดึงข้อมูลการประเมินผลรวม
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor', 'admin'])(request);
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
        OR: [
          { supervisorId: user.id },
          { courseInstructorId: user.id },
          user.roles.includes('admin') ? {} : { id: 'none' }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        internship: {
          include: {
            company: {
              select: {
                name: true
              }
            }
          }
        },
        weeklyReports: {
          orderBy: {
            weekNumber: 'asc'
          }
        },
        supervisorAppointments: {
          where: {
            status: 'completed'
          },
          orderBy: {
            completedAt: 'asc'
          }
        },
        evaluations: {
          include: {
            evaluator: {
              select: {
                name: true
              }
            },
            form: {
              select: {
                name: true
              }
            }
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
    console.error('Error fetching evaluation data:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลการประเมินได้' },
      { status: 500 }
    );
  }
}

// POST - บันทึกการประเมินผลรวมและจบการฝึกงาน
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor', 'admin'])(request);
    const { applicationId, finalScore, finalComments, completionDate } = await request.json();

    if (!applicationId || !finalScore) {
      return NextResponse.json(
        { error: 'ต้องระบุข้อมูลครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        OR: [
          { supervisorId: user.id },
          { courseInstructorId: user.id },
          user.roles.includes('admin') ? {} : { id: 'none' }
        ],
        status: 'internship_ongoing'
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอฝึกงานหรือสถานะไม่ถูกต้อง' },
        { status: 404 }
      );
    }

    // สร้างการประเมินผลรวม
    const evaluation = await prisma.evaluation.create({
      data: {
        formId: 'final-evaluation', // ใช้ form ID สำหรับการประเมินผลรวม
        applicationId,
        evaluatorId: user.id,
        evaluatorType: 'supervisor',
        score: parseInt(finalScore),
        comments: finalComments
      }
    });

    // อัปเดตสถานะเป็นจบการฝึกงาน
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'internship_completed',
        preferredStartDate: completionDate ? new Date(completionDate) : application.preferredStartDate
      }
    });

    // สร้างหนังสือรับรองการฝึกงาน
    const certificate = await prisma.internshipDocument.create({
      data: {
        applicationId,
        type: 'internship_certificate',
        title: 'หนังสือรับรองการฝึกงาน',
        titleEn: 'Internship Certificate',
        content: `หนังสือรับรองการฝึกงานของ ${application.student.name} ที่ ${application.internship.company.name} ระหว่างวันที่ ${application.preferredStartDate?.toLocaleDateString('th-TH')} ถึง ${completionDate ? new Date(completionDate).toLocaleDateString('th-TH') : 'ปัจจุบัน'}`,
        generatedBy: user.id,
        status: 'approved'
      }
    });

    // ส่งการแจ้งเตือนไปยังนักศึกษา
    await prisma.notification.create({
      data: {
        userId: application.studentId,
        type: 'evaluation_due',
        title: 'การฝึกงานเสร็จสิ้น',
        message: `การฝึกงานของคุณที่ ${application.internship.company.name} เสร็จสิ้นแล้ว สามารถดาวน์โหลดหนังสือรับรองได้`,
        actionUrl: `/student/applications/${applicationId}/documents`
      }
    });

    // ส่งการแจ้งเตือนไปยังฝ่ายธุรการ
    await prisma.notification.create({
      data: {
        userId: 'staff',
        type: 'application_status_change',
        title: 'การฝึกงานเสร็จสิ้น',
        message: `การฝึกงานของ ${application.student.name} ที่ ${application.internship.company.name} เสร็จสิ้นแล้ว`,
        actionUrl: `/admin/applications/post-approval`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกการประเมินผลรวมและจบการฝึกงานเรียบร้อย',
      application: updatedApplication,
      evaluation,
      certificate
    });

  } catch (error) {
    console.error('Error completing internship:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกการประเมินผลรวมได้' },
      { status: 500 }
    );
  }
}
