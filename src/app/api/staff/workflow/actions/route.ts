import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  receiveDocument,
  reviewDocument,
  approveDocument,
  sendDocumentToCompany
} from '@/lib/staff-workflow';
import { z } from 'zod';

const staffActionSchema = z.object({
  applicationId: z.string().min(1, 'ต้องระบุรหัสคำขอฝึกงาน'),
  action: z.enum(['receive_document', 'review_document', 'approve_document', 'send_to_company']),
  notes: z.string().optional()
});

// POST - Staff ดำเนินการตาม Workflow
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const result = staffActionSchema.safeParse(body);

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

    const { applicationId, action, notes } = result.data;
    const staffId = authResult.user.id;

    let result_data;

    switch (action) {
      case 'receive_document':
        result_data = await receiveDocument({
          applicationId,
          staffId,
          notes
        });
        break;

      case 'review_document':
        result_data = await reviewDocument({
          applicationId,
          staffId,
          notes
        });
        break;

      case 'approve_document':
        result_data = await approveDocument({
          applicationId,
          staffId,
          notes
        });
        break;

      case 'send_to_company':
        result_data = await sendDocumentToCompany({
          applicationId,
          staffId,
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
    console.error('Error in staff workflow action:', error);
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
