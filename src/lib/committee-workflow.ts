import { prisma } from '@/lib/prisma';

export interface CommitteeWorkflowData {
  applicationId: string;
  committeeId: string;
  action: 'receive_application' | 'review_application';
  status?: 'approved' | 'rejected';
  feedback?: string;
}

export interface CommitteeWorkflowStatus {
  currentStep: 'application_received' | 'committee_reviewed' | 'completed';
  committeeReceived: boolean;
  committeeReviewed: boolean;
  isCompleted: boolean;
}

/**
 * 1. กรรมการรับคำขอหลังจากอาจารย์ประจำวิชาอนุมัติ
 */
export async function receiveApplication(data: {
  applicationId: string;
  committeeId: string;
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

    // ตรวจสอบว่าอาจารย์ประจำวิชาได้อนุมัติแล้วหรือไม่
    if (!application.courseInstructorApprovedAt || application.courseInstructorStatus !== 'approved') {
      return {
        success: false,
        error: 'อาจารย์ประจำวิชายังไม่อนุมัติ ไม่สามารถรับคำขอได้'
      };
    }

    // ตรวจสอบว่าได้รับคำขอแล้วหรือไม่
    if (application.committeeReceived) {
      return {
        success: false,
        error: 'ได้รับคำขอแล้ว'
      };
    }

    // อัปเดตสถานะการรับคำขอ
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        committeeReceived: true,
        committeeWorkflowStep: 'application_received',
        committeeWorkflowNotes: data.notes || null,
        committeeReceivedAt: new Date(),
        committeeStatus: 'pending'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            e_name: true
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
      message: 'รับคำขอเรียบร้อย'
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
 * 2. กรรมการตรวจดูและอนุมัติ/ไม่อนุมัติ
 */
export async function reviewApplication(data: {
  applicationId: string;
  committeeId: string;
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

    if (!application.committeeReceived) {
      return {
        success: false,
        error: 'ยังไม่ได้รับคำขอ ไม่สามารถพิจารณาได้'
      };
    }

    // อัปเดตสถานะการพิจารณา
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        committeeReviewed: true,
        committeeWorkflowStep: 'committee_reviewed',
        committeeWorkflowNotes: data.feedback || application.committeeWorkflowNotes,
        committeeReviewedAt: new Date(),
        committeeStatus: data.status,
        committeeFeedback: data.feedback,
        committeeApprovedAt: data.status === 'approved' ? new Date() : null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            e_name: true
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

    // สร้าง CommitteeApproval record
    await prisma.committeeApproval.create({
      data: {
        applicationId: data.applicationId,
        committeeId: data.committeeId,
        status: data.status,
        feedback: data.feedback,
        approvedAt: data.status === 'approved' ? new Date() : null
      }
    });

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
 * ตรวจสอบสถานะ Committee Workflow
 */
export async function getCommitteeWorkflowStatus(applicationId: string): Promise<CommitteeWorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const committeeReceived = application.committeeReceived;
    const committeeReviewed = application.committeeReviewed;

    let currentStep: CommitteeWorkflowStatus['currentStep'] = 'application_received';
    
    if (!committeeReceived) {
      currentStep = 'application_received';
    } else if (committeeReceived && !committeeReviewed) {
      currentStep = 'committee_reviewed';
    } else if (committeeReviewed) {
      currentStep = 'completed';
    }

    return {
      currentStep,
      committeeReceived,
      committeeReviewed,
      isCompleted: committeeReviewed
    };
  } catch (error) {
    console.error('Error getting committee workflow status:', error);
    throw error;
  }
}

/**
 * ดึงรายการ Application ที่รอกรรมการรับ
 */
export async function getPendingCommitteeReceipt(committeeId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        courseInstructorStatus: 'approved',
        courseInstructorApprovedAt: { not: null },
        committeeReceived: false
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            e_name: true
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
      orderBy: { courseInstructorApprovedAt: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting pending committee receipt:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่กรรมการรับแล้ว
 */
export async function getCommitteeApplications(committeeId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        committeeReceived: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
                    t_name: true,
                    e_name: true
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
      orderBy: { committeeReceivedAt: 'desc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting committee applications:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Committee Approvals
 */
export async function getCommitteeApprovals(committeeId: string) {
  try {
    const approvals = await prisma.committeeApproval.findMany({
      where: {
        committeeId: committeeId
      },
      include: {
        application: {
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      approvals
    };
  } catch (error) {
    console.error('Error getting committee approvals:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
