import { prisma } from '@/lib/prisma';

export interface StaffWorkflowData {
  applicationId: string;
  staffId: string;
  action: 'receive_document' | 'review_document' | 'approve_document' | 'send_to_company';
  notes?: string;
}

export interface StaffWorkflowStatus {
  currentStep: 'document_received' | 'document_reviewed' | 'document_approved' | 'document_sent_to_company' | 'completed';
  documentReceived: boolean;
  documentReviewed: boolean;
  documentApproved: boolean;
  documentSentToCompany: boolean;
  isCompleted: boolean;
}

/**
 * 1. Staff ได้รับเอกสารของ Student
 */
export async function receiveDocument(data: {
  applicationId: string;
  staffId: string;
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

    // ตรวจสอบว่า Student Workflow เสร็จสิ้นแล้วหรือไม่
    if (!application.staffReviewed) {
      return {
        success: false,
        error: 'Student Workflow ยังไม่เสร็จสิ้น ไม่สามารถรับเอกสารได้'
      };
    }

    // อัปเดตสถานะการรับเอกสาร
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        documentReceived: true,
        staffWorkflowStep: 'document_received',
        staffWorkflowNotes: data.notes || null
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
      message: 'รับเอกสารเรียบร้อย'
    };
  } catch (error) {
    console.error('Error receiving document:', error);
    return {
      success: false,
      error: 'ไม่สามารถรับเอกสารได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 2. Staff ตรวจเอกสาร
 */
export async function reviewDocument(data: {
  applicationId: string;
  staffId: string;
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

    if (!application.documentReceived) {
      return {
        success: false,
        error: 'ยังไม่ได้รับเอกสาร ไม่สามารถตรวจสอบได้'
      };
    }

    // อัปเดตสถานะการตรวจเอกสาร
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        documentReviewed: true,
        staffWorkflowStep: 'document_reviewed',
        staffWorkflowNotes: data.notes || application.staffWorkflowNotes,
        documentReviewedAt: new Date()
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
      message: 'ตรวจเอกสารเรียบร้อย'
    };
  } catch (error) {
    console.error('Error reviewing document:', error);
    return {
      success: false,
      error: 'ไม่สามารถตรวจเอกสารได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 3. Staff อนุมัติเอกสารและยืนยัน
 */
export async function approveDocument(data: {
  applicationId: string;
  staffId: string;
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

    if (!application.documentReviewed) {
      return {
        success: false,
        error: 'ยังไม่ได้ตรวจเอกสาร ไม่สามารถอนุมัติได้'
      };
    }

    // อัปเดตสถานะการอนุมัติเอกสาร
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        documentApproved: true,
        staffWorkflowStep: 'document_approved',
        staffWorkflowNotes: data.notes || application.staffWorkflowNotes,
        documentApprovedAt: new Date()
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
      message: 'อนุมัติเอกสารเรียบร้อย'
    };
  } catch (error) {
    console.error('Error approving document:', error);
    return {
      success: false,
      error: 'ไม่สามารถอนุมัติเอกสารได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 4. Staff ส่งเอกสารให้บริษัท
 */
export async function sendDocumentToCompany(data: {
  applicationId: string;
  staffId: string;
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

    if (!application.documentApproved) {
      return {
        success: false,
        error: 'ยังไม่ได้อนุมัติเอกสาร ไม่สามารถส่งให้บริษัทได้'
      };
    }

    // อัปเดตสถานะการส่งเอกสารให้บริษัท
    const updatedApplication = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        documentSentToCompany: true,
        staffWorkflowStep: 'document_sent_to_company',
        staffWorkflowNotes: data.notes || application.staffWorkflowNotes,
        documentSentAt: new Date()
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
      message: 'ส่งเอกสารให้บริษัทเรียบร้อย'
    };
  } catch (error) {
    console.error('Error sending document to company:', error);
    return {
      success: false,
      error: 'ไม่สามารถส่งเอกสารให้บริษัทได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ตรวจสอบสถานะ Staff Workflow
 */
export async function getStaffWorkflowStatus(applicationId: string): Promise<StaffWorkflowStatus> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('ไม่พบคำขอฝึกงาน');
    }

    const documentReceived = application.documentReceived;
    const documentReviewed = application.documentReviewed;
    const documentApproved = application.documentApproved;
    const documentSentToCompany = application.documentSentToCompany;

    let currentStep: StaffWorkflowStatus['currentStep'] = 'document_received';
    
    if (!documentReceived) {
      currentStep = 'document_received';
    } else if (documentReceived && !documentReviewed) {
      currentStep = 'document_reviewed';
    } else if (documentReviewed && !documentApproved) {
      currentStep = 'document_approved';
    } else if (documentApproved && !documentSentToCompany) {
      currentStep = 'document_sent_to_company';
    } else if (documentSentToCompany) {
      currentStep = 'completed';
    }

    return {
      currentStep,
      documentReceived,
      documentReviewed,
      documentApproved,
      documentSentToCompany,
      isCompleted: documentSentToCompany
    };
  } catch (error) {
    console.error('Error getting staff workflow status:', error);
    throw error;
  }
}

/**
 * ดึงรายการ Application ที่รอ Staff รับเอกสาร
 */
export async function getPendingDocumentReceipt() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        staffReviewed: true,
        documentReceived: false
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
      orderBy: { staffReviewedAt: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting pending document receipt:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่อยู่ใน Staff Workflow
 */
export async function getStaffWorkflowApplications() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        documentReceived: true,
        documentSentToCompany: false
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
      orderBy: { documentReceivedAt: 'asc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting staff workflow applications:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * ดึงรายการ Application ที่เสร็จสิ้น Staff Workflow
 */
export async function getCompletedStaffWorkflow() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        documentSentToCompany: true
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
      orderBy: { documentSentAt: 'desc' }
    });

    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting completed staff workflow:', error);
    return {
      success: false,
      error: 'ไม่สามารถดึงข้อมูลได้',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
