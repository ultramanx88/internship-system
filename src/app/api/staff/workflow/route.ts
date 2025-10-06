import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  getPendingDocumentReceipt,
  getStaffWorkflowApplications,
  getCompletedStaffWorkflow,
  getStaffWorkflowStatus
} from '@/lib/staff-workflow';

// GET - ดึงรายการ Application ตามสถานะ
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const applicationId = searchParams.get('applicationId');

    switch (action) {
      case 'pending_receipt':
        // รายการที่รอรับเอกสาร
        const pendingReceiptResult = await getPendingDocumentReceipt();
        return NextResponse.json(pendingReceiptResult);

      case 'workflow':
        // รายการที่อยู่ใน Staff Workflow
        const workflowResult = await getStaffWorkflowApplications();
        return NextResponse.json(workflowResult);

      case 'completed':
        // รายการที่เสร็จสิ้น Staff Workflow
        const completedResult = await getCompletedStaffWorkflow();
        return NextResponse.json(completedResult);

      case 'status':
        // ตรวจสอบสถานะ Staff Workflow
        if (!applicationId) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุรหัสคำขอฝึกงาน' },
            { status: 400 }
          );
        }
        const statusResult = await getStaffWorkflowStatus(applicationId);
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
    console.error('Error in staff workflow GET:', error);
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
