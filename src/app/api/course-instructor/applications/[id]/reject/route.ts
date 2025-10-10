import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { courseInstructorReview } from '@/lib/application-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { rejectionNote, feedback } = body;

    if (!rejectionNote || !rejectionNote.trim()) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุเหตุผลในการไม่อนุมัติ' },
        { status: 400 }
      );
    }

    const result = await courseInstructorReview({
      applicationId: (await params).id,
      courseInstructorId: user.id,
      status: 'rejected',
      feedback,
      rejectionNote: rejectionNote.trim()
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'ปฏิเสธคำขอเรียบร้อย',
      application: result.application
    });
  } catch (error) {
    console.error('Course Instructor Reject API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถปฏิเสธคำขอได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
