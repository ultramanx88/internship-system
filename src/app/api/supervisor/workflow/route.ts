import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  getPendingSupervisorAssignments,
  getSupervisorAssignments,
  getSupervisorAppointments,
  getSupervisorWorkflowStatus
} from '@/lib/supervisor-workflow';

// GET - ดึงรายการ Application ตามสถานะ
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['supervisor', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const applicationId = searchParams.get('applicationId');
    const supervisorId = authResult.user.id;

    switch (action) {
      case 'pending_assignments':
        // รายการที่รออาจารย์นิเทศรับมอบหมาย
        const pendingAssignmentsResult = await getPendingSupervisorAssignments(supervisorId);
        return NextResponse.json(pendingAssignmentsResult);

      case 'my_assignments':
        // รายการที่อาจารย์นิเทศรับแล้ว
        const myAssignmentsResult = await getSupervisorAssignments(supervisorId);
        return NextResponse.json(myAssignmentsResult);

      case 'appointments':
        // รายการนัดหมายนิเทศ
        const appointmentsResult = await getSupervisorAppointments(supervisorId);
        return NextResponse.json(appointmentsResult);

      case 'status':
        // ตรวจสอบสถานะ Supervisor Workflow
        if (!applicationId) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุรหัสคำขอฝึกงาน' },
            { status: 400 }
          );
        }
        const statusResult = await getSupervisorWorkflowStatus(applicationId);
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
    console.error('Error in supervisor workflow GET:', error);
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
