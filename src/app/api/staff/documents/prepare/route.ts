import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['staff', 'admin']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { applicationId, notes } = body || {};
    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      return NextResponse.json({ success: false, error: 'ไม่พบคำขอฝึกงาน' }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        documentsPrepared: true,
        documentsPreparedAt: new Date(),
        staffWorkflowNotes: notes || application.staffWorkflowNotes,
        status: 'awaiting_external_response'
      }
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Staff documents prepare error:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถเตรียมเอกสารได้' }, { status: 500 });
  } finally {
    await cleanup();
  }
}


