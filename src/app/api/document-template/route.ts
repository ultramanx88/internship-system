import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Document template GET - Starting...');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError);
      throw connError;
    }

    const currentYear = new Date().getFullYear();
    const defaultTemplate = {
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

    console.log('🔍 Querying database for document template...');
    // Get from database
    const template = await prisma.documentTemplate.findFirst({
      where: { type: 'DOCUMENT_NUMBER' }
    });

    if (template) {
      console.log('✅ Found existing template:', template.id);
      const parsedData = JSON.parse(template.template);
      console.log('✅ Template data:', parsedData);
      
      return NextResponse.json({
        success: true,
        data: parsedData
      });
    } else {
      console.log('⚠️ No template found, creating default...');
      // Create default template if none exists
      const newTemplate = await prisma.documentTemplate.create({
        data: {
          name: 'Document Number Settings',
          type: 'DOCUMENT_NUMBER',
          template: JSON.stringify(defaultTemplate),
          isActive: true
        }
      });
      console.log('✅ Created default template:', newTemplate.id);

      return NextResponse.json({
        success: true,
        data: defaultTemplate
      });
    }

  } catch (error) {
    console.error('❌ Document template GET error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError);
    }
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

    // Save to database
    const existing = await prisma.documentTemplate.findFirst({ where: { type: 'DOCUMENT_NUMBER' } });
    if (existing) {
      await prisma.documentTemplate.update({
        where: { id: existing.id },
        data: { template: JSON.stringify(config), name: existing.name || 'Document Number Settings' }
      });
    } else {
      await prisma.documentTemplate.create({
        data: {
          name: 'Document Number Settings',
          type: 'DOCUMENT_NUMBER',
          template: JSON.stringify(config),
          isActive: true
        }
      });
    }

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
