import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  receiveAssignment,
  confirmAssignment,
  scheduleAppointment
} from '@/lib/supervisor-workflow';
import { z } from 'zod';

const supervisorActionSchema = z.object({
  applicationId: z.string().min(1, 'ต้องระบุรหัสคำขอฝึกงาน'),
  action: z.enum(['receive_assignment', 'confirm_assignment', 'schedule_appointment']),
  notes: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentLocation: z.string().optional()
});

// POST - อาจารย์นิเทศดำเนินการตาม Workflow
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['supervisor', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const result = supervisorActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: result.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { applicationId, action, notes, appointmentDate, appointmentLocation } = result.data;
    const supervisorId = authResult.user.id;

    let result_data;

    switch (action) {
      case 'receive_assignment':
        result_data = await receiveAssignment({
          applicationId,
          supervisorId,
          notes
        });
        break;

      case 'confirm_assignment':
        result_data = await confirmAssignment({
          applicationId,
          supervisorId,
          notes
        });
        break;

      case 'schedule_appointment':
        if (!appointmentDate) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุวันที่นัดหมาย' },
            { status: 400 }
          );
        }
        result_data = await scheduleAppointment({
          applicationId,
          supervisorId,
          appointmentDate,
          appointmentLocation,
          notes
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action ไม่ถูกต้อง' },
          { status: 400 }
        );
    }

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error in supervisor workflow action:', error);
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
