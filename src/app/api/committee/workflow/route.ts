import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  getPendingCommitteeReceipt,
  getCommitteeApplications,
  getCommitteeApprovals,
  getCommitteeWorkflowStatus
} from '@/lib/committee-workflow';

// GET - ดึงรายการ Application ตามสถานะ
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['committee', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const applicationId = searchParams.get('applicationId');
    const committeeId = authResult.user.id;

    switch (action) {
      case 'pending_receipt':
        // รายการที่รอกรรมการรับ
        const pendingReceiptResult = await getPendingCommitteeReceipt(committeeId);
        return NextResponse.json(pendingReceiptResult);

      case 'my_applications':
        // รายการที่กรรมการรับแล้ว
        const myApplicationsResult = await getCommitteeApplications(committeeId);
        return NextResponse.json(myApplicationsResult);

      case 'approvals':
        // รายการการอนุมัติของกรรมการ
        const approvalsResult = await getCommitteeApprovals(committeeId);
        return NextResponse.json(approvalsResult);

      case 'status':
        // ตรวจสอบสถานะ Committee Workflow
        if (!applicationId) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุรหัสคำขอฝึกงาน' },
            { status: 400 }
          );
        }
        const statusResult = await getCommitteeWorkflowStatus(applicationId);
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
    console.error('Error in committee workflow GET:', error);
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
