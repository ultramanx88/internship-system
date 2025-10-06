import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  getPendingStaffReview, 
  staffReviewApplication 
} from '@/lib/student-workflow';
import { z } from 'zod';

const reviewApplicationSchema = z.object({
  applicationId: z.string().min(1, 'ต้องระบุรหัสคำขอฝึกงาน'),
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().optional()
});

// GET - ดึงรายการที่รอ Staff ตรวจสอบ
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const result = await getPendingStaffReview();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error getting pending staff review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

// POST - Staff ตรวจสอบและยืนยัน
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const result = reviewApplicationSchema.safeParse(body);

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

    const { applicationId, status, feedback } = result.data;
    const staffId = authResult.user.id;

    const result_data = await staffReviewApplication({
      applicationId,
      staffId,
      status,
      feedback
    });

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error in staff review:', error);
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
