import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()(request);

    const appointmentId = params.id;
    const body = await request.json();
    const { reportContent } = body;

    if (!reportContent) {
      return NextResponse.json(
        { error: 'Report content is required' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์
    const appointment = await prisma.supervisorAppointment.findUnique({
      where: { id: appointmentId },
      select: { supervisorId: true }
    });

    if (!appointment || appointment.supervisorId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to complete this appointment' },
        { status: 403 }
      );
    }

    // อัปเดตการนัดหมายเป็นเสร็จสิ้น
    const updatedAppointment = await prisma.supervisorAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        reportContent
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
      }
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment completed successfully'
    });
  } catch (error) {
    console.error('Error completing supervisor appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
