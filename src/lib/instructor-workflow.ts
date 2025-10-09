import { prisma } from '@/lib/prisma';

export interface InstructorWorkflowData {
  applicationId: string;
  instructorId: string;
  action: 'receive_application' | 'review_application' | 'assign_supervisor';
  status?: 'approved' | 'rejected';
  feedback?: string;
  supervisorId?: string;
}

export interface InstructorWorkflowStatus {
  currentStep: 'application_received' | 'instructor_reviewed' | 'supervisor_assigned' | 'completed';
  instructorReceived: boolean;
  instructorReviewed: boolean;
  supervisorAssigned: boolean;
  isCompleted: boolean;
}

/**
 * 1. อาจารย์ประจำวิชาพบคำขอของ Student ที่เพิ่มเข้ามา
 */
export async function receiveApplication(data: {
  applicationId: string;
  instructorId: string;
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

    // ตรวจสอบว่า Staff Workflow เสร็จสิ้นแล้วหรือไม่
    if (!application.staffReviewed) {
      return {
        success: false,
        error: 'Staff Workflow ยังไม่เสร็จสิ้น ไม่สามารถรับคำขอได้'
      };
    }

    // ตรวจสอบว่าอาจารย์ประจำวิชาเป็นคนที่ถูกต้องหรือไม่
    if (application.courseInstructorId && application.courseInstructorId !== data.instructorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการรับคำขอนี้'
      };
    }

    // อัปเดตสถานะการรับคำขอ
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        courseInstructorId: data.instructorId,
        instructorReceived: true,
        instructorWorkflowStep: 'application_received',
        instructorWorkflowNotes: data.notes || null,
        instructorReceivedAt: new Date(),
        courseInstructorStatus: 'pending'
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
      message: 'รับคำขอฝึกงานเรียบร้อย'
    };
  } catch (error) {
    console.error('Error receiving application:', error);
    return {
      success: false,
      error: 'ไม่สามารถรับคำขอได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 2. อาจารย์ประจำวิชาดูรายละเอียดและอนุมัติ/ไม่อนุมัติ
 */
export async function reviewApplication(data: {
  applicationId: string;
  instructorId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
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

    if (application.courseInstructorId !== data.instructorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการพิจารณาคำขอนี้'
      };
    }

    if (!application.instructorReceived) {
      return {
        success: false,
        error: 'ยังไม่ได้รับคำขอ ไม่สามารถพิจารณาได้'
      };
    }

    // อัปเดตสถานะการพิจารณา
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        instructorReviewed: true,
        instructorWorkflowStep: 'instructor_reviewed',
        instructorWorkflowNotes: data.feedback || application.instructorWorkflowNotes,
        instructorReviewedAt: new Date(),
        courseInstructorStatus: data.status,
        courseInstructorFeedback: data.feedback,
        courseInstructorApprovedAt: data.status === 'approved' ? new Date() : null
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

    // หากอนุมัติ ให้ดำเนินการขั้นตอนต่อไป
    if (data.status === 'approved') {
      // กำหนดอาจารย์นิเทศก์ (ขั้นตอนที่ 3)
      await assignSupervisor(data.applicationId);
    } else {
      // หากไม่อนุมัติ ให้ rollback Student ไปที่ workflow 2
      await rollbackStudentWorkflow(data.applicationId);
    }

    return {
      success: true,
      application: updatedApplication,
      message: data.status === 'approved' 
        ? 'อนุมัติคำขอฝึกงานเรียบร้อย' 
        : 'ปฏิเสธคำขอฝึกงานเรียบร้อย'
    };
  } catch (error) {
    console.error('Error reviewing application:', error);
    return {
      success: false,
      error: 'ไม่สามารถดำเนินการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 3. กำหนดอาจารย์นิเทศก์ (หากอนุมัติ)
 */
export async function assignSupervisor(applicationId: string) {
  try {
    // หาอาจารย์นิเทศก์ที่เหมาะสม
    const supervisor = await findSuitableSupervisor(applicationId);
    
    if (supervisor) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          supervisorId: supervisor.id,
          supervisorAssigned: true,
          supervisorAssignedAt: new Date(),
          instructorWorkflowStep: 'supervisor_assigned',
          supervisorStatus: 'assigned'
        }
      });

      return {
        success: true,
        supervisor,
        message: 'กำหนดอาจารย์นิเทศก์เรียบร้อย'
      };
    } else {
      return {
        success: false,
        error: 'ไม่พบอาจารย์นิเทศก์ที่เหมาะสม',
        message: 'ไม่สามารถกำหนดอาจารย์นิเทศก์ได้'
      };
    }
  } catch (error) {
    console.error('Error assigning supervisor:', error);
    return {
      success: false,
      error: 'ไม่สามารถกำหนดอาจารย์นิเทศก์ได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Rollback Student Workflow ไปที่ขั้นตอนที่ 2 (หากไม่อนุมัติ)
 */
export async function rollbackStudentWorkflow(applicationId: string) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        // Rollback Student Workflow
        studentWorkflowStep: 'application_submitted',
        applicationSubmitted: true,
        staffReviewed: false,
        staffFeedback: null,
        staffReviewedAt: null,
        
        // Reset Staff Workflow
        staffWorkflowStep: null,
        documentReceived: false,
        documentReviewed: false,
        documentApproved: false,
        documentSentToCompany: false,
        staffWorkflowNotes: null,
        documentReviewedAt: null,
        documentApprovedAt: null,
        documentSentAt: null,
        
        // Reset Instructor Workflow
        instructorWorkflowStep: null,
        instructorReceived: false,
        instructorReviewed: false,
        supervisorAssigned: false,
        instructorWorkflowNotes: null,
        instructorReceivedAt: null,
        instructorReviewedAt: null,
        supervisorAssignedAt: null,
        
        // Reset Course Instructor Workflow
        courseInstructorStatus: 'rejected',
        supervisorStatus: 'pending',
        committeeStatus: 'pending',
        courseInstructorFeedback: null,
        supervisorFeedback: null,
        committeeFeedback: null,
        courseInstructorApprovedAt: null,
        supervisorAssignedAt: null,
        committeeApprovedAt: null,
        
        // Reset status
        status: 'pending'
      }
    });

    return {
      success: true,
      message: 'Rollback Student Workflow เรียบร้อย'
    };
  } catch (error) {
    console.error('Error rolling back student workflow:', error);
    return {
      success: false,
      error: 'ไม่สามารถ Rollback ได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ตรวจสอบสถานะ Instructor Workflow
 */
export async function getInstructorWorkflowStatus(applicationId: string): Promise<InstructorWorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const instructorReceived = application.instructorReceived;
    const instructorReviewed = application.instructorReviewed;
    const supervisorAssigned = application.supervisorAssigned;

    let currentStep: InstructorWorkflowStatus['currentStep'] = 'application_received';
    
    if (!instructorReceived) {
      currentStep = 'application_received';
    } else if (instructorReceived && !instructorReviewed) {
      currentStep = 'instructor_reviewed';
    } else if (instructorReviewed && !supervisorAssigned) {
      currentStep = 'supervisor_assigned';
    } else if (supervisorAssigned) {
      currentStep = 'completed';
    }

    return {
      currentStep,
      instructorReceived,
      instructorReviewed,
      supervisorAssigned,
      isCompleted: supervisorAssigned
    };
  } catch (error) {
    console.error('Error getting instructor workflow status:', error);
    throw error;
  }
}

/**
 * ดึงรายการ Application ที่รออาจารย์ประจำวิชารับ
 */
export async function getPendingInstructorReceipt() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        staffReviewed: true,
        instructorReceived: false,
        courseInstructorId: null
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
      orderBy: { staffReviewedAt: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting pending instructor receipt:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่อาจารย์ประจำวิชารับแล้ว
 */
export async function getInstructorApplications(instructorId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        courseInstructorId: instructorId,
        instructorReceived: true
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
      orderBy: { instructorReceivedAt: 'desc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting instructor applications:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper functions
async function findSuitableSupervisor(applicationId: string) {
  // Business logic สำหรับหาอาจารย์นิเทศก์ที่เหมาะสม
  // อาจจะใช้ข้อมูลจาก application, student, internship, etc.
  return await prisma.user.findFirst({
    where: {
      roles: { contains: 'supervisor' }
    }
  });
}