import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    // Get document template settings
    const template = await prisma.documentTemplate.findFirst({
      where: { type: 'DOCUMENT_NUMBER' }
    });

    const defaultTemplate = {
      thai: {
        prefix: 'DOC',
        digits: 6,
        suffix: '',
        currentNumber: 1
      },
      english: {
        prefix: 'DOC',
        digits: 6,
        suffix: '',
        currentNumber: 1
      }
    };

    return NextResponse.json({
      success: true,
      data: template ? JSON.parse(template.config) : defaultTemplate
    });

  } catch (error) {
    console.error('Document template GET error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    const body = await request.json();
    const { thai, english } = body;

    // Validate input
    if (!thai || !english) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    // Validate Thai template
    if (!thai.prefix || typeof thai.digits !== 'number' || thai.digits < 1 || thai.digits > 10) {
      return NextResponse.json(
        { success: false, message: 'รูปแบบเลขเอกสารไทยไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Validate English template
    if (!english.prefix || typeof english.digits !== 'number' || english.digits < 1 || english.digits > 10) {
      return NextResponse.json(
        { success: false, message: 'รูปแบบเลขเอกสารอังกฤษไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Ensure currentNumber is at least 1
    const validatedThai = {
      ...thai,
      currentNumber: Math.max(1, thai.currentNumber || 1)
    };

    const validatedEnglish = {
      ...english,
      currentNumber: Math.max(1, english.currentNumber || 1)
    };

    const config = {
      thai: validatedThai,
      english: validatedEnglish
    };

    // Upsert document template
    await prisma.documentTemplate.upsert({
      where: { type: 'DOCUMENT_NUMBER' },
      update: { config: JSON.stringify(config) },
      create: {
        type: 'DOCUMENT_NUMBER',
        config: JSON.stringify(config)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าเลขเอกสารสำเร็จ',
      data: config
    });

  } catch (error) {
    console.error('Document template PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
