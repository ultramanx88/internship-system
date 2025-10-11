import { prisma } from '@/lib/prisma';

// Helper function to create notifications
async function createNotification(data: {
  userId: string;
  type: 'application_status_change' | 'document_ready' | 'appointment_scheduled' | 'report_due' | 'evaluation_due' | 'system_announcement';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}) {
  try {
    // หาก userId เป็น 'staff' ให้ส่งไปยัง staff ทุกคน
    if (data.userId === 'staff') {
      const staffUsers = await prisma.user.findMany({
        where: {
          roles: {
            contains: 'staff'
          }
        },
        select: {
          id: true
        }
      });

      const notifications = staffUsers.map(staff => ({
        userId: staff.id,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          metadata: data.metadata
        }
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export interface ApplicationWorkflowData {
  applicationId: string;
  studentId: string;
  courseInstructorId?: string;
  supervisorId?: string;
  committeeIds?: string[];
}

export interface WorkflowStatus {
  currentStep: 'submitted' | 'course_instructor_review' | 'supervisor_assignment' | 'committee_review' | 'awaiting_external_response' | 'company_accepted' | 'internship_started' | 'internship_ongoing' | 'internship_completed' | 'completed' | 'rejected';
  courseInstructorStatus: 'pending' | 'approved' | 'rejected';
  supervisorStatus: 'pending' | 'assigned' | 'completed';
  committeeStatus: 'pending' | 'approved' | 'rejected';
  externalResponseStatus?: 'pending' | 'accepted' | 'rejected';
  isCompleted: boolean;
  isRejected: boolean;
}

/**
 * 1. นักศึกษาขอฝึกงานกรอกเอกสาร
 * สร้าง Application ใหม่ด้วย status = 'pending'
 */
export async function createApplication(data: {
  studentId: string;
  projectTopic?: string;
  feedback?: string;
  companyName?: string;
  position?: string;
}) {
  try {
    // หาอาจารย์ประจำวิชาที่เหมาะสม (ตาม business logic)
    const courseInstructor = await findSuitableCourseInstructor(data.studentId);
    
    const application = await prisma.application.create({
      data: {
        studentId: data.studentId,
        status: 'submitted',
        dateApplied: new Date(),
        projectTopic: data.projectTopic || null,
        feedback: data.feedback || null,
        courseInstructorId: courseInstructor?.id,
        companyName: data.companyName || null,
        position: data.position || null
      },
      include: {
        student: true,
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
  rejectionNote?: string;
}) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { student: true }
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
        status: data.status === 'approved' ? 'course_instructor_approved' : 'course_instructor_rejected',
        feedback: data.feedback,
        courseInstructorRejectionNote: data.status === 'rejected' ? data.rejectionNote : null,
      },
      include: {
        student: true,
        courseInstructor: true
      }
    });

    // หากอนุมัติ ให้เปลี่ยนสถานะเป็นรอมอบหมายอาจารย์นิเทศก์
    if (data.status === 'approved') {
      await prisma.application.update({
        where: { id: data.applicationId },
        data: {
          status: 'supervisor_assignment_pending'
        }
      });
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
 * 3.1 มอบหมายอาจารย์นิเทศก์แบบ Manual (สำหรับอาจารย์ประจำวิชาเลือกเอง)
 */
export async function assignSupervisorManually(data: {
  applicationId: string;
  supervisorId: string;
  courseInstructorId: string;
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

    if (application.courseInstructorId !== data.courseInstructorId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการมอบหมายคำขอนี้'
      };
    }

    // ตรวจสอบว่าอาจารย์นิเทศก์มี role visitor
    const supervisor = await prisma.user.findUnique({
      where: { id: data.supervisorId },
      select: { id: true, name: true, roles: true }
    });

    if (!supervisor || !supervisor.roles.includes('visitor')) {
      return {
        success: false,
        error: 'ผู้ใช้ที่เลือกไม่ใช่อาจารย์นิเทศก์'
      };
    }

    // อัปเดต Application
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        supervisorId: data.supervisorId,
        supervisorStatus: 'assigned',
        supervisorAssignedAt: new Date(),
        status: 'assigned_supervisor'
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // ส่งไปยังกรรมการ
    await sendToCommittee(data.applicationId);

    return {
      success: true,
      application: updatedApplication,
      supervisor,
      message: 'มอบหมายอาจารย์นิเทศก์เรียบร้อย'
    };
  } catch (error) {
    console.error('Error assigning supervisor manually:', error);
    return {
      success: false,
      error: 'ไม่สามารถมอบหมายอาจารย์นิเทศก์ได้',
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
            student: true
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
    const approvalThreshold = Math.ceil(totalCount / 2); // >50%
    
    if (approvedCount >= approvalThreshold) {
      finalStatus = 'approved';
    } else if (rejectedCount >= approvalThreshold) {
      finalStatus = 'rejected';
    }

    // อัปเดตสถานะรวมของ Application
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        committeeStatus: finalStatus,
        status: finalStatus === 'approved' ? 'documents_prepared' : 
                finalStatus === 'rejected' ? 'course_instructor_rejected' : 'committee_pending',
        committeeApprovedAt: finalStatus === 'approved' ? new Date() : null
      },
      include: { student: true }
    });

    // หากกรรมการอนุมัติครบ ให้สร้าง CompanyResponse record และแจ้งเตือนฝ่ายธุรการ
    if (finalStatus === 'approved') {
      // ส่งการแจ้งเตือนไปยังฝ่ายธุรการ
      await createNotification({
        userId: 'staff', // ระบบจะส่งไปยัง staff ทุกคน
        type: 'application_status_change',
        title: 'คำขอฝึกงานรอการเตรียมเอกสาร',
        message: `คำขอฝึกงานของ ${updatedApplication.student.name} ได้รับการอนุมัติจากกรรมการแล้ว โปรดเตรียมเอกสารเพื่อส่งภายนอก`,
        actionUrl: `/admin/applications/post-approval`
      });

      // ส่งการแจ้งเตือนไปยังนักศึกษา
      await createNotification({
        userId: updatedApplication.studentId,
        type: 'application_status_change',
        title: 'คำขอฝึกงานได้รับการอนุมัติจากกรรมการ',
        message: `คำขอฝึกงานของคุณได้รับการอนุมัติจากกรรมการแล้ว กำลังรอฝ่ายธุรการเตรียมเอกสาร`,
        actionUrl: `/student/applications`
      });
    }

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
 * คำนวณสถานะการอนุมัติของกรรมการ
 */
export async function calculateCommitteeApprovalStatus(applicationId: string) {
  try {
    const allCommitteeApprovals = await prisma.applicationCommittee.findMany({
      where: { applicationId },
      include: {
        committee: {
          include: {
            members: true
          }
        }
      }
    });

    const approvedCount = allCommitteeApprovals.filter(ca => ca.status === 'approved').length;
    const rejectedCount = allCommitteeApprovals.filter(ca => ca.status === 'rejected').length;
    const totalCount = allCommitteeApprovals.length;
    const pendingCount = totalCount - approvedCount - rejectedCount;

    const approvalThreshold = 3; // internal rule: at least 3 approvals
    
    let finalStatus = 'pending';
    if (approvedCount >= approvalThreshold) {
      finalStatus = 'approved';
    } else if (rejectedCount >= approvalThreshold) {
      finalStatus = 'rejected';
    }

    return {
      success: true,
      approvedCount,
      rejectedCount,
      pendingCount,
      totalCount,
      approvalThreshold,
      finalStatus,
      isApproved: finalStatus === 'approved',
      isRejected: finalStatus === 'rejected',
      isPending: finalStatus === 'pending'
    };
  } catch (error) {
    console.error('Error calculating committee approval status:', error);
    return {
      success: false,
      error: 'ไม่สามารถคำนวณสถานะการอนุมัติได้',
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
      select: {
        id: true,
        status: true,
        externalResponseStatus: true
      }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    // Determine workflow status based on current application status
    const currentStatus = application.status;
    
    let currentStep: WorkflowStatus['currentStep'] = 'submitted';
    let courseInstructorStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    let supervisorStatus: 'pending' | 'assigned' | 'completed' = 'pending';
    let committeeStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    let externalResponseStatus: 'pending' | 'accepted' | 'rejected' | undefined = undefined;
    
    // Map current status to workflow steps
    switch (currentStatus) {
      case 'submitted':
        currentStep = 'submitted';
        courseInstructorStatus = 'pending';
        break;
      case 'course_instructor_pending':
        currentStep = 'course_instructor_review';
        courseInstructorStatus = 'pending';
        break;
      case 'course_instructor_approved':
        currentStep = 'supervisor_assignment';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'pending';
        break;
      case 'course_instructor_rejected':
        currentStep = 'rejected';
        courseInstructorStatus = 'rejected';
        break;
      case 'committee_pending':
        currentStep = 'committee_review';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'assigned';
        committeeStatus = 'pending';
        break;
      case 'committee_approved':
        currentStep = 'awaiting_external_response';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'assigned';
        committeeStatus = 'approved';
        externalResponseStatus = 'pending';
        break;
      case 'documents_prepared':
        currentStep = 'awaiting_external_response';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'assigned';
        committeeStatus = 'approved';
        externalResponseStatus = 'pending';
        break;
      case 'company_accepted':
        currentStep = 'company_accepted';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'assigned';
        committeeStatus = 'approved';
        externalResponseStatus = 'accepted';
        break;
      case 'company_rejected':
        currentStep = 'rejected';
        courseInstructorStatus = 'approved';
        supervisorStatus = 'assigned';
        committeeStatus = 'approved';
        externalResponseStatus = 'rejected';
        break;
      default:
        currentStep = 'submitted';
    }

    return {
      currentStep,
      courseInstructorStatus,
      supervisorStatus,
      committeeStatus,
      externalResponseStatus,
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
  // เลือกอาจารย์ประจำวิชาตามการ assign รายคณะ แยกปีการศึกษา/ภาคเรียนปัจจุบัน
  // ขั้นตอน:
  // 1) หา faculty ของนักศึกษา
  // 2) หา AcademicYear และ Semester ที่ active (และอยู่ในช่วงวันที่ปัจจุบัน ถ้ามี)
  // 3) ค้นหา FacultyInstructorAssignment ที่ active สำหรับ (faculty, year, semester)
  // 4) คืนค่า instructor ที่ถูก assign
  // 5) หากหาไม่พบ ให้ fallback ไปที่ผู้ใช้ที่มีบทบาท courseInstructor คนแรก

  // 1) นักศึกษา + faculty
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { facultyId: true }
  });

  // หากไม่มี faculty ของนักศึกษา ให้ fallback ทันที
  if (!student?.facultyId) {
    return await prisma.user.findFirst({ where: { roles: { contains: 'courseInstructor' } } });
  }

  // 2) หา year/semester ปัจจุบัน (active + within date range ถ้ามี)
  const now = new Date();
  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: {
      isActive: true,
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] }
      ]
    },
    orderBy: [{ year: 'desc' }]
  });

  if (!currentAcademicYear) {
    // ไม่มีปีการศึกษาปัจจุบัน -> fallback
    return await prisma.user.findFirst({ where: { roles: { contains: 'courseInstructor' } } });
  }

  const currentSemester = await prisma.semester.findFirst({
    where: {
      academicYearId: currentAcademicYear.id,
      isActive: true,
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] }
      ]
    },
    orderBy: [{ startDate: 'desc' }]
  });

  if (!currentSemester) {
    // ไม่มีภาคเรียนปัจจุบัน -> fallback
    return await prisma.user.findFirst({ where: { roles: { contains: 'courseInstructor' } } });
  }

  // 3) หา assignment สำหรับคณะของนักศึกษาในปี/เทอมปัจจุบัน
  const assignment = await prisma.facultyInstructorAssignment.findFirst({
    where: {
      facultyId: student.facultyId,
      academicYearId: currentAcademicYear.id,
      semesterId: currentSemester.id,
      isActive: true
    },
    include: { instructor: true },
    orderBy: [{ updatedAt: 'desc' }]
  });

  // 4) คืน instructor ถ้าพบ
  if (assignment?.instructor) {
    return assignment.instructor;
  }

  // 5) Fallback: หากยังไม่พบ ให้เลือกผู้ใช้ที่มีบทบาท courseInstructor คนแรก
  return await prisma.user.findFirst({ where: { roles: { contains: 'courseInstructor' } } });
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

/**
 * 6. เมื่อกรรมการอนุมัติครบ ให้เปลี่ยนสถานะเป็น "รอการตอบรับจากสถานประกอบการ"
 */
export async function sendToCompany(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงานที่ระบุ'
      };
    }

    // ตรวจสอบว่าคำขอได้รับการอนุมัติจากกรรมการแล้ว
    if (application.committeeStatus !== 'approved') {
      return {
        success: false,
        error: 'คำขอยังไม่ได้รับการอนุมัติจากกรรมการ'
      };
    }

    // สร้าง CompanyResponse record
    const companyResponse = await prisma.companyResponse.create({
      data: {
        applicationId,
        companyId: application.internship.companyId,
        status: 'pending'
      }
    });

    // อัปเดตสถานะ Application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'waiting_company_response'
      }
    });

    // ส่งการแจ้งเตือนไปยังฝ่ายธุรการ
    await createNotification({
      userId: 'staff', // จะต้องหาผู้ใช้ที่มีบทบาท staff
      type: 'application_status_change',
      title: 'คำขอฝึกงานรอการส่งไปยังสถานประกอบการ',
      message: `คำขอฝึกงานของ ${application.student.name} รอการส่งไปยัง ${application.internship.company.name}`,
      actionUrl: `/admin/applications/${applicationId}`
    });

    return {
      success: true,
      application: updatedApplication,
      companyResponse,
      message: 'ส่งคำขอไปยังสถานประกอบการเรียบร้อย'
    };
  } catch (error) {
    console.error('Error sending to company:', error);
    return {
      success: false,
      error: 'ไม่สามารถส่งคำขอไปยังสถานประกอบการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 7. สถานประกอบการตอบรับ/ปฏิเสธ
 */
export async function companyResponse(data: {
  applicationId: string;
  companyId: string;
  status: 'accepted' | 'rejected';
  responseNote?: string;
  documentUrl?: string;
}) {
  try {
    const companyResponse = await prisma.companyResponse.update({
      where: {
        applicationId_companyId: {
          applicationId: data.applicationId,
          companyId: data.companyId
        }
      },
      data: {
        status: data.status,
        responseDate: new Date(),
        responseNote: data.responseNote,
        documentUrl: data.documentUrl
      },
      include: {
        application: {
          include: {
            student: true,
            internship: {
              include: {
                company: true
              }
            }
          }
        }
      }
    });

    // อัปเดตสถานะ Application
    const newStatus = data.status === 'accepted' ? 'company_accepted' : 'rejected';
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        status: newStatus
      }
    });

    // ส่งการแจ้งเตือน
    const notificationMessage = data.status === 'accepted' 
      ? `สถานประกอบการ ${companyResponse.application.internship.company.name} ตอบรับคำขอฝึกงานของ ${companyResponse.application.student.name}`
      : `สถานประกอบการ ${companyResponse.application.internship.company.name} ปฏิเสธคำขอฝึกงานของ ${companyResponse.application.student.name}`;

    await createNotification({
      userId: companyResponse.application.studentId,
      type: 'application_status_change',
      title: 'การตอบรับจากสถานประกอบการ',
      message: notificationMessage,
      actionUrl: `/student/applications/${data.applicationId}`
    });

    // หากตอบรับ ให้สร้างเอกสารหนังสือส่งตัว
    if (data.status === 'accepted') {
      await generateStudentIntroductionLetter(data.applicationId);
    }

    return {
      success: true,
      companyResponse,
      application: updatedApplication,
      message: data.status === 'accepted' ? 'สถานประกอบการตอบรับคำขอเรียบร้อย' : 'สถานประกอบการปฏิเสธคำขอเรียบร้อย'
    };
  } catch (error) {
    console.error('Error processing company response:', error);
    return {
      success: false,
      error: 'ไม่สามารถประมวลผลการตอบรับจากสถานประกอบการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 8. นักศึกษาเริ่มฝึกงาน
 */
export async function startInternship(data: {
  applicationId: string;
  studentId: string;
  startDate: Date;
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

    if (application.studentId !== data.studentId) {
      return {
        success: false,
        error: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'
      };
    }

    if (application.status !== 'company_accepted') {
      return {
        success: false,
        error: 'คำขอยังไม่ได้รับการตอบรับจากสถานประกอบการ'
      };
    }

    // อัปเดตสถานะ Application
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        status: 'internship_started',
        preferredStartDate: data.startDate
      }
    });

    // ส่งการแจ้งเตือนไปยังอาจารย์นิเทศก์
    if (application.supervisorId) {
      await createNotification({
        userId: application.supervisorId,
        type: 'application_status_change',
        title: 'นักศึกษาเริ่มฝึกงาน',
        message: `นักศึกษา ${application.student?.name} เริ่มฝึกงานแล้ว`,
        actionUrl: `/supervisor/applications/${data.applicationId}`
      });
    }

    return {
      success: true,
      application: updatedApplication,
      message: 'บันทึกการเริ่มฝึกงานเรียบร้อย'
    };
  } catch (error) {
    console.error('Error starting internship:', error);
    return {
      success: false,
      error: 'ไม่สามารถบันทึกการเริ่มฝึกงานได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 9. สร้างเอกสารหนังสือส่งตัว
 */
export async function generateStudentIntroductionLetter(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
      return {
        success: false,
        error: 'ไม่พบคำขอฝึกงานที่ระบุ'
      };
    }

    // สร้างเอกสารหนังสือส่งตัว
    const document = await prisma.internshipDocument.create({
      data: {
        applicationId,
        type: 'student_introduction_letter',
        title: 'หนังสือส่งตัวนักศึกษา',
        titleEn: 'Student Introduction Letter',
        content: `หนังสือส่งตัวนักศึกษา ${application.student.name} ไปยัง ${application.internship.company.name}`,
        status: 'approved'
      }
    });

    return {
      success: true,
      document,
      message: 'สร้างหนังสือส่งตัวเรียบร้อย'
    };
  } catch (error) {
    console.error('Error generating student introduction letter:', error);
    return {
      success: false,
      error: 'ไม่สามารถสร้างหนังสือส่งตัวได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function createNotification is already defined at the top of the file

/**
 * บันทึกผลตอบรับจากสถานประกอบการ (สำหรับ Staff)
 */
export async function recordExternalResponse(data: {
  applicationId: string;
  status: 'accepted' | 'rejected';
  responseNote?: string;
  documentUrl?: string;
}) {
  try {
    // หา Application และ Company ที่เกี่ยวข้อง
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        },
        companyResponses: true
      }
    });

    if (!application) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลคำขอฝึกงาน'
      };
    }

    // อัปเดตสถานะ Application
    const newStatus = data.status === 'accepted' ? 'company_accepted' : 'rejected';
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // สร้างหรืออัปเดต Company Response
    const companyResponse = await prisma.companyResponse.upsert({
      where: {
        applicationId_companyId: {
          applicationId: data.applicationId,
          companyId: application.internship.companyId
        }
      },
      update: {
        status: data.status,
        responseDate: new Date(),
        responseNote: data.responseNote,
        documentUrl: data.documentUrl
      },
      create: {
        applicationId: data.applicationId,
        companyId: application.internship.companyId,
        status: data.status,
        responseDate: new Date(),
        responseNote: data.responseNote,
        documentUrl: data.documentUrl
      }
    });

    // ส่งการแจ้งเตือน
    const notificationMessage = data.status === 'accepted' 
      ? `สถานประกอบการ ${application.internship.company.name} ตอบรับคำขอฝึกงานของ ${application.student.name}`
      : `สถานประกอบการ ${application.internship.company.name} ปฏิเสธคำขอฝึกงานของ ${application.student.name}`;

    await createNotification({
      userId: application.studentId,
      type: 'application_status_change',
      title: 'สถานประกอบการตอบรับ/ปฏิเสธ',
      message: notificationMessage,
      actionUrl: `/student/applications/${data.applicationId}`,
      metadata: {
        applicationId: data.applicationId,
        companyId: application.internship.companyId,
        status: data.status
      }
    });

    return {
      success: true,
      data: {
        application: updatedApplication,
        companyResponse: companyResponse
      }
    };
  } catch (error) {
    console.error('Record external response error:', error);
    return {
      success: false,
      error: 'บันทึกผลตอบรับไม่สำเร็จ'
    };
  }
}
