import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    // Numbering is disabled in the current flow
    return NextResponse.json(
      { success: false, message: 'ปิดการใช้งานการสร้างเลขที่เอกสาร' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Document number generation error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการสร้างเลขเอกสาร' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
