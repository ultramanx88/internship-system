import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  courseInstructorReview, 
  committeeReview, 
  getApplicationWorkflowStatus 
} from '@/lib/application-workflow';
import { z } from 'zod';

const courseInstructorReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().optional()
});

const committeeReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().optional()
});

// GET - ดูสถานะ workflow ของ application
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff', 'courseInstructor', 'committee', 'student']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const applicationId = (await params).id;
    const workflowStatus = await getApplicationWorkflowStatus(applicationId);

    return NextResponse.json({
      success: true,
      workflowStatus
    });

  } catch (error) {
    console.error('Error getting workflow status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลสถานะ workflow ได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

// POST - อาจารย์ประจำวิชาพิจารณา
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const applicationId = (await params).id;
    const body = await request.json();
    const result = courseInstructorReviewSchema.safeParse(body);

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

    const { status, feedback } = result.data;
    const courseInstructorId = authResult.user.id;

    const result_data = await courseInstructorReview({
      applicationId,
      courseInstructorId,
      status,
      feedback
    });

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error in course instructor review:', error);
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

// PUT - กรรมการพิจารณา
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(request, ['committee']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const applicationId = (await params).id;
    const body = await request.json();
    const result = committeeReviewSchema.safeParse(body);

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

    const { status, feedback } = result.data;
    const committeeId = authResult.user.id;

    const result_data = await committeeReview({
      applicationId,
      committeeId,
      status,
      feedback
    });

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error in committee review:', error);
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
