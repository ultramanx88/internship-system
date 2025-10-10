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
    const { supervisorId, feedback } = body;

    if (!supervisorId) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุอาจารย์นิเทศก์' },
        { status: 400 }
      );
    }

    // อนุมัติคำขอและมอบหมายอาจารย์นิเทศก์
    const result = await courseInstructorReview({
      applicationId: (await params).id,
      courseInstructorId: user.id,
      status: 'approved',
      feedback
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // มอบหมายอาจารย์นิเทศก์
    const { assignSupervisorManually } = await import('@/lib/application-workflow');
    const assignmentResult = await assignSupervisorManually({
      applicationId: (await params).id,
      supervisorId,
      courseInstructorId: user.id
    });

    if (!assignmentResult.success) {
      return NextResponse.json(assignmentResult, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'อนุมัติคำขอและมอบหมายอาจารย์นิเทศก์เรียบร้อย',
      application: assignmentResult.application,
      supervisor: assignmentResult.supervisor
    });
  } catch (error) {
    console.error('Course Instructor Approve API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถอนุมัติคำขอได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
