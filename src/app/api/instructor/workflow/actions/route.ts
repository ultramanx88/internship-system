import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  receiveApplication,
  reviewApplication
} from '@/lib/instructor-workflow';
import { z } from 'zod';

const instructorActionSchema = z.object({
  applicationId: z.string().min(1, 'ต้องระบุรหัสคำขอฝึกงาน'),
  action: z.enum(['receive_application', 'review_application']),
  status: z.enum(['approved', 'rejected']).optional(),
  feedback: z.string().optional()
});

// POST - อาจารย์ประจำวิชาดำเนินการตาม Workflow
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const result = instructorActionSchema.safeParse(body);

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

    const { applicationId, action, status, feedback } = result.data;
    const instructorId = authResult.user.id;

    let result_data;

    switch (action) {
      case 'receive_application':
        result_data = await receiveApplication({
          applicationId,
          instructorId,
          notes: feedback
        });
        break;

      case 'review_application':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุสถานะการพิจารณา' },
            { status: 400 }
          );
        }
        result_data = await reviewApplication({
          applicationId,
          instructorId,
          status,
          feedback
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
    console.error('Error in instructor workflow action:', error);
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
