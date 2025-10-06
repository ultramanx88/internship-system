import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  getPendingInstructorReceipt,
  getInstructorApplications,
  getInstructorWorkflowStatus
} from '@/lib/instructor-workflow';

// GET - ดึงรายการ Application ตามสถานะ
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const applicationId = searchParams.get('applicationId');
    const instructorId = authResult.user.id;

    switch (action) {
      case 'pending_receipt':
        // รายการที่รออาจารย์ประจำวิชารับ
        const pendingReceiptResult = await getPendingInstructorReceipt();
        return NextResponse.json(pendingReceiptResult);

      case 'my_applications':
        // รายการที่อาจารย์ประจำวิชารับแล้ว
        const myApplicationsResult = await getInstructorApplications(instructorId);
        return NextResponse.json(myApplicationsResult);

      case 'status':
        // ตรวจสอบสถานะ Instructor Workflow
        if (!applicationId) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุรหัสคำขอฝึกงาน' },
            { status: 400 }
          );
        }
        const statusResult = await getInstructorWorkflowStatus(applicationId);
        return NextResponse.json({
          success: true,
          workflowStatus: statusResult
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Action ไม่ถูกต้อง' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in instructor workflow GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดำเนินการได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
