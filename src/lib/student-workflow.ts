import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PendingStaffReviewResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export interface StaffReviewResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ดึงรายการที่รอ Staff ตรวจสอบ
export async function getPendingStaffReview(): Promise<PendingStaffReviewResult> {
  try {
    const applications = await prisma.application.findMany({
      where: {
        status: 'submitted', // สถานะที่รอ Staff ตรวจสอบ
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        internship: {
          include: {
            company: {
              select: {
                name: true,
                nameEn: true,
              }
            }
          }
        },
        _count: {
          select: {
            reports: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: applications
    };
  } catch (error) {
    console.error('Error getting pending staff review:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้'
    };
  }
}

// Staff ตรวจสอบและยืนยันคำขอ
export async function staffReviewApplication({
  applicationId,
  staffId,
  status,
  feedback
}: {
  applicationId: string;
  staffId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
}): Promise<StaffReviewResult> {
  try {
    // ตรวจสอบว่าคำขอมีอยู่จริง
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงาน'
      };
    }

    // อัปเดตสถานะคำขอ
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status === 'approved' ? 'approved' : 'rejected',
        staffFeedback: feedback,
        reviewedAt: new Date(),
        reviewedBy: staffId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        internship: {
          include: {
            company: {
              select: {
                name: true,
                nameEn: true,
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      data: updatedApplication
    };
  } catch (error) {
    console.error('Error in staff review:', error);
    return {
      success: false,
      error: 'ไม่สามารถดำเนินการได้'
    };
  }
}
