import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const currentYear = new Date().getFullYear();
    const defaultConfig = {
      thai: {
        prefix: 'มทร',
        digits: 6,
        suffix: `/${currentYear + 543}`, // พ.ศ.
        currentNumber: 1
      },
      english: {
        prefix: 'DOC',
        digits: 6,
        suffix: `/${currentYear}`, // ค.ศ.
        currentNumber: 1
      }
    };

    // Delete existing document template
    await prisma.documentTemplate.deleteMany({
      where: { type: 'DOCUMENT_NUMBER' }
    });

    // Create new document template with default values
    await prisma.documentTemplate.create({
      data: {
        name: 'Document Number Settings',
        type: 'DOCUMENT_NUMBER',
        template: JSON.stringify(defaultConfig),
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'รีเซ็ตการตั้งค่าเลขเอกสารเป็นค่าเริ่มต้นสำเร็จ',
      data: defaultConfig
    });

  } catch (error) {
    console.error('Document template reset error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ตการตั้งค่า' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
