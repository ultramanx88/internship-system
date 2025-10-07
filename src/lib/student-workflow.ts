import { prisma } from '@/lib/prisma';

export interface StudentWorkflowData {
  studentId: string;
  internshipId: string;
  projectTopic?: string;
  feedback?: string;
}

export interface StudentWorkflowStatus {
  currentStep: 'profile_incomplete' | 'profile_complete' | 'application_submitted' | 'staff_reviewed' | 'completed';
  profileComplete: boolean;
  applicationSubmitted: boolean;
  staffReviewed: boolean;
  canSubmitApplication: boolean;
  isCompleted: boolean;
}

/**
 * ตรวจสอบว่านักศึกษากรอกรายละเอียดครบถ้วนหรือไม่
 */
export async function checkStudentProfileComplete(studentId: string): Promise<boolean> {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        name: true,
        email: true,
        tName: true,
        eName: true,
        tSurname: true,
        eSurname: true,
        tTitle: true,
        eTitle: true,
        phone: true,
        address: true,
        profileImage: true,
        majorId: true,
        departmentId: true,
        facultyId: true,
        curriculumId: true
      }
    });

    if (!student) return false;

    // ตรวจสอบข้อมูลที่จำเป็น
    const requiredFields = [
      student.name,
      student.email,
      student.tName,
      student.tSurname,
      student.tTitle,
      student.phone,
      student.address,
      student.majorId,
      student.departmentId,
      student.facultyId,
      student.curriculumId
    ];

    // ต้องกรอกข้อมูลครบถ้วนอย่างน้อย 80%
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== '').length;
    const completionRate = filledFields / requiredFields.length;

    return completionRate >= 0.8;
  } catch (error) {
    console.error('Error checking student profile:', error);
    return false;
  }
}

/**
 * 1. นักศึกษาสมัครเข้ามา - ตรวจสอบโปรไฟล์
 */
export async function checkStudentEligibility(studentId: string) {
  try {
    const profileComplete = await checkStudentProfileComplete(studentId);
    
    return {
      success: true,
      profileComplete,
      canSubmitApplication: profileComplete,
      message: profileComplete 
        ? 'ข้อมูลครบถ้วน สามารถขอฝึกงานได้' 
        : 'กรุณากรอกรายละเอียดให้ครบถ้วนก่อนขอฝึกงาน'
    };
  } catch (error) {
    console.error('Error checking student eligibility:', error);
    return {
      success: false,
      error: 'ไม่สามารถตรวจสอบข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 2. กรอกรายละเอียดคำร้อง - สร้าง Application
 */
export async function createStudentApplication(data: StudentWorkflowData) {
  try {
    // ตรวจสอบว่านักศึกษาสามารถขอฝึกงานได้หรือไม่
    const eligibilityCheck = await checkStudentEligibility(data.studentId);
    
    if (!eligibilityCheck.success || !eligibilityCheck.canSubmitApplication) {
      return {
        success: false,
        error: 'ไม่สามารถขอฝึกงานได้',
        details: eligibilityCheck.message
      };
    }

    // ตรวจสอบว่ามี Application ที่ยังไม่เสร็จสิ้นหรือไม่
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: data.studentId,
        status: { in: ['pending', 'approved'] }
      }
    });

    if (existingApplication) {
      return {
        success: false,
        error: 'คุณมีคำขอฝึกงานที่ยังไม่เสร็จสิ้นอยู่แล้ว',
        details: 'กรุณารอให้คำขอปัจจุบันเสร็จสิ้นก่อนสร้างคำขอใหม่'
      };
    }

    // สร้าง Application ใหม่
    const application = await prisma.application.create({
      data: {
        studentId: data.studentId,
        internshipId: data.internshipId,
        status: 'pending',
        dateApplied: new Date(),
        projectTopic: data.projectTopic,
        feedback: data.feedback,
        
        // Student Workflow
        studentWorkflowStep: 'profile_complete',
        studentProfileComplete: true,
        applicationSubmitted: true,
        staffReviewed: false,
        
        // Course Instructor Workflow (ยังไม่เริ่ม)
        courseInstructorStatus: 'pending',
        supervisorStatus: 'pending',
        committeeStatus: 'pending'
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
      application,
      message: 'ส่งคำขอฝึกงานเรียบร้อย'
    };
  } catch (error) {
    console.error('Error creating student application:', error);
    return {
      success: false,
      error: 'ไม่สามารถส่งคำขอฝึกงานได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 3. Staff ตรวจเอกสารและยืนยัน
 */
export async function staffReviewApplication(data: {
  applicationId: string;
  staffId: string;
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

    // อัปเดตสถานะการตรวจสอบของ Staff
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        staffReviewed: true,
        staffFeedback: data.feedback,
        staffReviewedAt: new Date(),
        studentWorkflowStep: data.status === 'approved' ? 'staff_reviewed' : 'completed',
        status: data.status === 'approved' ? 'pending' : 'rejected' // เปลี่ยน status หลัก
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

    // หาก Staff อนุมัติ ให้ส่งไปยังอาจารย์ประจำวิชาต่อ
    if (data.status === 'approved') {
      // TODO: ส่งไปยังอาจารย์ประจำวิชา (Course Instructor Workflow)
      // await sendToCourseInstructor(data.applicationId);
    }

    return {
      success: true,
      application: updatedApplication,
      message: data.status === 'approved' 
        ? 'ตรวจเอกสารและอนุมัติเรียบร้อย' 
        : 'ตรวจเอกสารและปฏิเสธเรียบร้อย'
    };
  } catch (error) {
    console.error('Error in staff review:', error);
    return {
      success: false,
      error: 'ไม่สามารถดำเนินการได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ตรวจสอบสถานะ Student Workflow
 */
export async function getStudentWorkflowStatus(applicationId: string): Promise<StudentWorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const profileComplete = application.studentProfileComplete;
    const applicationSubmitted = application.applicationSubmitted;
    const staffReviewed = application.staffReviewed;

    let currentStep: StudentWorkflowStatus['currentStep'] = 'profile_incomplete';
    
    if (!profileComplete) {
      currentStep = 'profile_incomplete';
    } else if (profileComplete && !applicationSubmitted) {
      currentStep = 'profile_complete';
    } else if (applicationSubmitted && !staffReviewed) {
      currentStep = 'profile_complete'; // แสดงขั้นตอนที่ 2 เมื่อส่งคำขอแล้ว
    } else if (staffReviewed) {
      currentStep = 'staff_reviewed';
    }

    return {
      currentStep,
      profileComplete,
      applicationSubmitted,
      staffReviewed,
      canSubmitApplication: profileComplete && !applicationSubmitted,
      isCompleted: staffReviewed
    };
  } catch (error) {
    console.error('Error getting student workflow status:', error);
    throw error;
  }
}

/**
 * ดึงรายการ Application ของนักศึกษา
 */
export async function getStudentApplications(studentId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
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
      orderBy: { dateApplied: 'desc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting student applications:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลคำขอฝึกงานได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่รอ Staff ตรวจสอบ
 */
export async function getPendingStaffReview() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        applicationSubmitted: true,
        staffReviewed: false
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
      orderBy: { dateApplied: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting pending staff review:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลคำขอที่รอตรวจสอบได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
