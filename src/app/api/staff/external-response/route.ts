import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { recordExternalResponse } from '@/lib/application-workflow';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['staff', 'admin']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { applicationId, status, responseNote, documentUrl } = body || {};
    if (!applicationId || !status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const result = await recordExternalResponse({ applicationId, status, responseNote, documentUrl });
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Staff external response error:', error);
    return NextResponse.json({ success: false, error: 'บันทึกผลตอบรับไม่สำเร็จ' }, { status: 500 });
  } finally {
    await cleanup();
  }
}


