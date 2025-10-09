import { prisma } from '@/lib/prisma';

export interface ApplicationWorkflowData {
  applicationId: string;
  studentId: string;
  internshipId: string;
  courseInstructorId?: string;
  supervisorId?: string;
  committeeIds?: string[];
}

export interface WorkflowStatus {
  currentStep: 'submitted' | 'course_instructor_review' | 'supervisor_assignment' | 'committee_review' | 'completed' | 'rejected';
  courseInstructorStatus: 'pending' | 'approved' | 'rejected';
  supervisorStatus: 'pending' | 'assigned' | 'completed';
  committeeStatus: 'pending' | 'approved' | 'rejected';
  isCompleted: boolean;
  isRejected: boolean;
}

/**
 * 1. นักศึกษาขอฝึกงานกรอกเอกสาร
 * สร้าง Application ใหม่ด้วย status = 'pending'
 */
export async function createApplication(data: {
  studentId: string;
  internshipId: string;
  projectTopic?: string;
  feedback?: string;
}) {
  try {
    // หาอาจารย์ประจำวิชาที่เหมาะสม (ตาม business logic)
    const courseInstructor = await findSuitableCourseInstructor(data.studentId);
    
    const application = await prisma.application.create({
      data: {
        studentId: data.studentId,
        internshipId: data.internshipId,
        status: 'pending',
        dateApplied: new Date(),
        projectTopic: data.projectTopic,
        feedback: data.feedback,
        courseInstructorId: courseInstructor?.id,
        courseInstructorStatus: 'pending',
        supervisorStatus: 'pending',
        committeeStatus: 'pending'
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        },
        courseInstructor: true
      }
    });

    return {
      success: true,
      application,
      message: 'สร้างคำขอฝึกงานสำเร็จ'
    };
  } catch (error) {
    console.error('Error creating application:', error);
    return {
      success: false,
      error: 'ไม่สามารถสร้างคำขอฝึกงานได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 2. อาจารย์ประจำวิชารับเรื่อง อนุมัติ/ไม่อนุมัติ
 */
export async function courseInstructorReview(data: {
  applicationId: string;
  courseInstructorId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
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

    if (application.courseInstructorId !== data.courseInstructorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการพิจารณาคำขอนี้'
      };
    }

    // อัปเดตสถานะการพิจารณาของอาจารย์ประจำวิชา
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        courseInstructorStatus: data.status,
        courseInstructorFeedback: data.feedback,
        courseInstructorApprovedAt: data.status === 'approved' ? new Date() : null,
        status: data.status === 'approved' ? 'pending' : 'rejected' // เปลี่ยน status หลัก
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        },
        courseInstructor: true
      }
    });

    // หากอนุมัติ ให้ดำเนินการขั้นตอนต่อไป
    if (data.status === 'approved') {
      // กำหนดอาจารย์นิเทศก์ (ขั้นตอนที่ 3)
      await assignSupervisor(data.applicationId);
      
      // ส่งไปยังกรรมการ (ขั้นตอนที่ 4)
      await sendToCommittee(data.applicationId);
    }

    return {
      success: true,
      application: updatedApplication,
      message: data.status === 'approved' 
        ? 'อนุมัติคำขอฝึกงานเรียบร้อย' 
        : 'ปฏิเสธคำขอฝึกงานเรียบร้อย'
    };
  } catch (error) {
    console.error('Error in course instructor review:', error);
    return {
      success: false,
      error: 'ไม่สามารถดำเนินการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 3. หากอาจารย์ประจำวิชาอนุมัติ ให้ assign อาจารย์นิเทศก์
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
          supervisorStatus: 'assigned',
          supervisorAssignedAt: new Date()
        }
      });
    }

    return {
      success: true,
      supervisor,
      message: supervisor ? 'กำหนดอาจารย์นิเทศก์เรียบร้อย' : 'ไม่พบอาจารย์นิเทศก์ที่เหมาะสม'
    };
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
 * 4. ส่งไปยังกรรมการทุกคน
 */
export async function sendToCommittee(applicationId: string) {
  try {
    // หากรรมการทั้งหมดที่ใช้งานอยู่ในเทอมปัจจุบัน
    const committees = await getActiveCommittees();
    
    // สร้าง CommitteeApproval records สำหรับกรรมการทุกคน
    const committeeApprovals = await Promise.all(
      committees.map(committee =>
        prisma.committeeApproval.upsert({
          where: {
            applicationId_committeeId: {
              applicationId,
              committeeId: committee.id
            }
          },
          update: {
            status: 'pending'
          },
          create: {
            applicationId,
            committeeId: committee.id,
            status: 'pending'
          }
        })
      )
    );

    // อัปเดตสถานะของ Application
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        committeeStatus: 'pending'
      }
    });

    return {
      success: true,
      committeeApprovals,
      message: `ส่งไปยังกรรมการ ${committees.length} คนเรียบร้อย`
    };
  } catch (error) {
    console.error('Error sending to committee:', error);
    return {
      success: false,
      error: 'ไม่สามารถส่งไปยังกรรมการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 5. กรรมการแต่ละคนอนุมัติ/ไม่อนุมัติ
 */
export async function committeeReview(data: {
  applicationId: string;
  committeeId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
}) {
  try {
    // อัปเดตการพิจารณาของกรรมการ
    const committeeApproval = await prisma.committeeApproval.update({
      where: {
        applicationId_committeeId: {
          applicationId: data.applicationId,
          committeeId: data.committeeId
        }
      },
      data: {
        status: data.status,
        feedback: data.feedback,
        approvedAt: data.status === 'approved' ? new Date() : null
      },
      include: {
        committee: true,
        application: {
          include: {
            student: true,
            internship: true
          }
        }
      }
    });

    // ตรวจสอบสถานะรวมของกรรมการ
    const allCommitteeApprovals = await prisma.committeeApproval.findMany({
      where: { applicationId: data.applicationId }
    });

    const approvedCount = allCommitteeApprovals.filter(ca => ca.status === 'approved').length;
    const rejectedCount = allCommitteeApprovals.filter(ca => ca.status === 'rejected').length;
    const totalCount = allCommitteeApprovals.length;

    let finalStatus = 'pending';
    if (rejectedCount > 0) {
      finalStatus = 'rejected';
    } else if (approvedCount === totalCount) {
      finalStatus = 'approved';
    }

    // อัปเดตสถานะรวมของ Application
    await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        committeeStatus: finalStatus,
        status: finalStatus === 'approved' ? 'approved' : 
                finalStatus === 'rejected' ? 'rejected' : 'pending',
        committeeApprovedAt: finalStatus === 'approved' ? new Date() : null
      }
    });

    return {
      success: true,
      committeeApproval,
      finalStatus,
      approvedCount,
      rejectedCount,
      totalCount,
      message: `บันทึกการพิจารณาของกรรมการเรียบร้อย (${approvedCount}/${totalCount} อนุมัติ)`
    };
  } catch (error) {
    console.error('Error in committee review:', error);
    return {
      success: false,
      error: 'ไม่สามารถบันทึกการพิจารณาได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ตรวจสอบสถานะของ Application
 */
export async function getApplicationWorkflowStatus(applicationId: string): Promise<WorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        committeeApprovals: true
      }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const courseInstructorStatus = application.courseInstructorStatus as 'pending' | 'approved' | 'rejected';
    const supervisorStatus = application.supervisorStatus as 'pending' | 'assigned' | 'completed';
    const committeeStatus = application.committeeStatus as 'pending' | 'approved' | 'rejected';

    let currentStep: WorkflowStatus['currentStep'] = 'submitted';
    
    if (courseInstructorStatus === 'rejected') {
      currentStep = 'rejected';
    } else if (courseInstructorStatus === 'pending') {
      currentStep = 'course_instructor_review';
    } else if (courseInstructorStatus === 'approved' && supervisorStatus === 'pending') {
      currentStep = 'supervisor_assignment';
    } else if (supervisorStatus === 'assigned' && committeeStatus === 'pending') {
      currentStep = 'committee_review';
    } else if (committeeStatus === 'approved') {
      currentStep = 'completed';
    } else if (committeeStatus === 'rejected') {
      currentStep = 'rejected';
    }

    return {
      currentStep,
      courseInstructorStatus,
      supervisorStatus,
      committeeStatus,
      isCompleted: currentStep === 'completed',
      isRejected: currentStep === 'rejected'
    };
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
}

// Helper functions
async function findSuitableCourseInstructor(studentId: string) {
  // Business logic สำหรับหาอาจารย์ประจำวิชาที่เหมาะสม
  // อาจจะใช้ข้อมูลจาก student's major, faculty, etc.
  return await prisma.user.findFirst({
    where: {
      roles: { contains: 'courseInstructor' }
    }
  });
}

async function findSuitableSupervisor(applicationId: string) {
  // Business logic สำหรับหาอาจารย์นิเทศก์ที่เหมาะสม
  return await prisma.user.findFirst({
    where: {
      roles: { contains: 'supervisor' }
    }
  });
}

async function getActiveCommittees() {
  // หากรรมการที่ใช้งานอยู่ในเทอมปัจจุบัน
  const currentDate = new Date();
  
  // หาปีการศึกษาและภาคเรียนปัจจุบัน
  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: {
      isActive: true,
      startDate: { lte: currentDate },
      endDate: { gte: currentDate }
    }
  });

  if (!currentAcademicYear) {
    return [];
  }

  const currentSemester = await prisma.semester.findFirst({
    where: {
      academicYearId: currentAcademicYear.id,
      isActive: true,
      startDate: { lte: currentDate },
      endDate: { gte: currentDate }
    }
  });

  if (!currentSemester) {
    return [];
  }

  // หา educator ที่มีบทบาท committee ในเทอมปัจจุบัน
  const committeeAssignments = await prisma.educatorRoleAssignment.findMany({
    where: {
      academicYearId: currentAcademicYear.id,
      semesterId: currentSemester.id,
      roles: { contains: 'committee' },
      isActive: true
    },
    include: {
      educator: true
    }
  });

  return committeeAssignments.map(assignment => assignment.educator);
}
