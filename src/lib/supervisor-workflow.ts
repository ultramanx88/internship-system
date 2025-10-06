import { prisma } from '@/lib/prisma';

export interface SupervisorWorkflowData {
  applicationId: string;
  supervisorId: string;
  action: 'receive_assignment' | 'confirm_assignment' | 'schedule_appointment';
  notes?: string;
  appointmentDate?: string;
  appointmentLocation?: string;
}

export interface SupervisorWorkflowStatus {
  currentStep: 'assignment_received' | 'supervisor_confirmed' | 'appointment_scheduled' | 'completed';
  supervisorReceived: boolean;
  supervisorConfirmed: boolean;
  appointmentScheduled: boolean;
  isCompleted: boolean;
}

/**
 * 1. อาจารย์นิเทศได้รับมอบหมายจากอาจารย์ประจำวิชา
 */
export async function receiveAssignment(data: {
  applicationId: string;
  supervisorId: string;
  notes?: string;
}) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { student: true, internship: true }
    });

    if (!application) {
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงานที่ระบุ'
      };
    }

    // ตรวจสอบว่าอาจารย์ประจำวิชาได้อนุมัติและกำหนดอาจารย์นิเทศแล้วหรือไม่
    if (!application.supervisorAssigned || application.supervisorId !== data.supervisorId) {
      return {
        success: false,
        error: 'ยังไม่ได้รับมอบหมายจากอาจารย์ประจำวิชา'
      };
    }

    // ตรวจสอบว่าได้รับมอบหมายแล้วหรือไม่
    if (application.supervisorReceived) {
      return {
        success: false,
        error: 'ได้รับมอบหมายแล้ว'
      };
    }

    // อัปเดตสถานะการรับมอบหมาย
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        supervisorReceived: true,
        supervisorWorkflowStep: 'assignment_received',
        supervisorWorkflowNotes: data.notes || null,
        supervisorReceivedAt: new Date(),
        supervisorStatus: 'assigned'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
    });

    return {
      success: true,
      application: updatedApplication,
      message: 'รับมอบหมายเรียบร้อย'
    };
  } catch (error) {
    console.error('Error receiving assignment:', error);
    return {
      success: false,
      error: 'ไม่สามารถรับมอบหมายได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 2. อาจารย์นิเทศตรวจดูและยืนยัน
 */
export async function confirmAssignment(data: {
  applicationId: string;
  supervisorId: string;
  notes?: string;
}) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId }
    });

    if (!application) {
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงานที่ระบุ'
      };
    }

    if (application.supervisorId !== data.supervisorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการยืนยันมอบหมายนี้'
      };
    }

    if (!application.supervisorReceived) {
      return {
        success: false,
        error: 'ยังไม่ได้รับมอบหมาย ไม่สามารถยืนยันได้'
      };
    }

    // อัปเดตสถานะการยืนยัน
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        supervisorConfirmed: true,
        supervisorWorkflowStep: 'supervisor_confirmed',
        supervisorWorkflowNotes: data.notes || application.supervisorWorkflowNotes,
        supervisorConfirmedAt: new Date(),
        supervisorStatus: 'confirmed'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
    });

    return {
      success: true,
      application: updatedApplication,
      message: 'ยืนยันมอบหมายเรียบร้อย'
    };
  } catch (error) {
    console.error('Error confirming assignment:', error);
    return {
      success: false,
      error: 'ไม่สามารถยืนยันมอบหมายได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 3. เข้าสู่รายการนัดหมายนิเทศ
 */
export async function scheduleAppointment(data: {
  applicationId: string;
  supervisorId: string;
  appointmentDate: string;
  appointmentLocation?: string;
  notes?: string;
}) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId }
    });

    if (!application) {
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงานที่ระบุ'
      };
    }

    if (application.supervisorId !== data.supervisorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการนัดหมายนี้'
      };
    }

    if (!application.supervisorConfirmed) {
      return {
        success: false,
        error: 'ยังไม่ได้ยืนยันมอบหมาย ไม่สามารถนัดหมายได้'
      };
    }

    // อัปเดตสถานะการนัดหมาย
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        appointmentScheduled: true,
        supervisorWorkflowStep: 'appointment_scheduled',
        supervisorWorkflowNotes: data.notes || application.supervisorWorkflowNotes,
        appointmentScheduledAt: new Date(),
        supervisorStatus: 'scheduled'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
    });

    // TODO: สร้าง Appointment record ในฐานข้อมูล
    // await createAppointmentRecord({
    //   applicationId: data.applicationId,
    //   supervisorId: data.supervisorId,
    //   studentId: application.studentId,
    //   appointmentDate: new Date(data.appointmentDate),
    //   location: data.appointmentLocation,
    //   notes: data.notes
    // });

    return {
      success: true,
      application: updatedApplication,
      message: 'นัดหมายนิเทศเรียบร้อย'
    };
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    return {
      success: false,
      error: 'ไม่สามารถนัดหมายได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ตรวจสอบสถานะ Supervisor Workflow
 */
export async function getSupervisorWorkflowStatus(applicationId: string): Promise<SupervisorWorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const supervisorReceived = application.supervisorReceived;
    const supervisorConfirmed = application.supervisorConfirmed;
    const appointmentScheduled = application.appointmentScheduled;

    let currentStep: SupervisorWorkflowStatus['currentStep'] = 'assignment_received';
    
    if (!supervisorReceived) {
      currentStep = 'assignment_received';
    } else if (supervisorReceived && !supervisorConfirmed) {
      currentStep = 'supervisor_confirmed';
    } else if (supervisorConfirmed && !appointmentScheduled) {
      currentStep = 'appointment_scheduled';
    } else if (appointmentScheduled) {
      currentStep = 'completed';
    }

    return {
      currentStep,
      supervisorReceived,
      supervisorConfirmed,
      appointmentScheduled,
      isCompleted: appointmentScheduled
    };
  } catch (error) {
    console.error('Error getting supervisor workflow status:', error);
    throw error;
  }
}

/**
 * ดึงรายการ Application ที่รออาจารย์นิเทศรับมอบหมาย
 */
export async function getPendingSupervisorAssignments(supervisorId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        supervisorId: supervisorId,
        supervisorAssigned: true,
        supervisorReceived: false
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
      },
      orderBy: { supervisorAssignedAt: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting pending supervisor assignments:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่อาจารย์นิเทศรับแล้ว
 */
export async function getSupervisorAssignments(supervisorId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        supervisorId: supervisorId,
        supervisorReceived: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
      },
      orderBy: { supervisorReceivedAt: 'desc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting supervisor assignments:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Appointment ของอาจารย์นิเทศ
 */
export async function getSupervisorAppointments(supervisorId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        supervisorId: supervisorId,
        appointmentScheduled: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            tName: true,
            eName: true
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
      },
      orderBy: { appointmentScheduledAt: 'desc' }
    });

    return {
      success: true,
      appointments: applications
    };
  } catch (error) {
    console.error('Error getting supervisor appointments:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
