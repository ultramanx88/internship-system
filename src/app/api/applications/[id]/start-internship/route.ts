import { NextRequest, NextResponse } from 'next/server';
import { startInternship } from '@/lib/application-workflow';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['student', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const applicationId = (await params).id;
    const body = await request.json();
    const { startDate } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }

    const result = await startInternship({
      applicationId,
      studentId: authResult.user.id,
      startDate: new Date(startDate)
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      application: result.application
    });
  } catch (error) {
    console.error('Error starting internship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
