import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET - ดึงรายการนัดหมายนิเทศ
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor'])(request);
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (appointmentId) {
      // ดึงรายละเอียดนัดหมายเดียว
      const appointment = await prisma.supervisorAppointment.findFirst({
        where: {
          id: appointmentId,
          supervisorId: user.id
        },
        include: {
          application: {
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
                      name: true,
                      address: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: 'ไม่พบนัดหมายหรือไม่มีสิทธิ์เข้าถึง' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        appointment
      });
    } else {
      // ดึงรายการนัดหมายทั้งหมด
      const appointments = await prisma.supervisorAppointment.findMany({
        where: {
          supervisorId: user.id
        },
        include: {
          application: {
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
              }
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        appointments
      });
    }

  } catch (error) {
    console.error('Error fetching supervisor appointments:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลนัดหมายได้' },
      { status: 500 }
    );
  }
}

// PUT - บันทึกผลนิเทศ
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(['courseInstructor'])(request);
    const { appointmentId, reportContent, attachments = [] } = await request.json();

    if (!appointmentId || !reportContent) {
      return NextResponse.json(
        { error: 'ต้องระบุข้อมูลครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const appointment = await prisma.supervisorAppointment.findFirst({
      where: {
        id: appointmentId,
        supervisorId: user.id
      },
      include: {
        application: {
          include: {
            student: true
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'ไม่พบนัดหมายหรือไม่มีสิทธิ์เข้าถึง' },
        { status: 404 }
      );
    }

    // อัปเดตผลนิเทศ
    const updatedAppointment = await prisma.supervisorAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        reportContent,
        attachments
      }
    });

    // ส่งการแจ้งเตือนไปยังนักศึกษา
    await prisma.notification.create({
      data: {
        userId: appointment.application.studentId,
        type: 'evaluation_due',
        title: 'ผลนิเทศพร้อมแล้ว',
        message: `อาจารย์นิเทศก์ได้บันทึกผลนิเทศเรียบร้อยแล้ว`,
        actionUrl: `/student/applications/${appointment.applicationId}/appointments`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกผลนิเทศเรียบร้อย',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating supervisor appointment:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกผลนิเทศได้' },
      { status: 500 }
    );
  }
}
