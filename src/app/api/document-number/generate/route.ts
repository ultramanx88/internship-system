import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const body = await request.json();
    const { language = 'thai' } = body;

    // Get document template
    const template = await prisma.documentTemplate.findFirst({
      where: { type: 'DOCUMENT_NUMBER' }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบการตั้งค่าเลขเอกสาร' },
        { status: 404 }
      );
    }

    const config = JSON.parse(template.config);
    const templateConfig = config[language] || config.thai;

    // Generate document number
    const currentNumber = templateConfig.currentNumber;
    const paddedNumber = currentNumber.toString().padStart(templateConfig.digits, '0');
    const documentNumber = `${templateConfig.prefix}${paddedNumber}${templateConfig.suffix}`;

    // Update current number
    const newConfig = {
      ...config,
      [language]: {
        ...templateConfig,
        currentNumber: currentNumber + 1
      }
    };

    await prisma.documentTemplate.update({
      where: { type: 'DOCUMENT_NUMBER' },
      data: { config: JSON.stringify(newConfig) }
    });

    return NextResponse.json({
      success: true,
      data: {
        documentNumber,
        language,
        nextNumber: currentNumber + 1
      }
    });

  } catch (error) {
    console.error('Document number generation error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการสร้างเลขเอกสาร' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
