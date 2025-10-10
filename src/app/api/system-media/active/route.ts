import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลไฟล์ระบบที่ใช้งานอยู่
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'logo', 'background', 'favicon'

    const where: any = { isActive: true };
    if (type) where.type = type;

    // Try to get from database, fallback to empty array if error
    try {
      const systemMedia = await prisma.systemMedia.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: systemMedia
      });
    } catch (dbError) {
      console.warn('Database access failed, using empty array:', dbError.message);
      return NextResponse.json({
        success: true,
        data: []
      });
    }

  } catch (error: any) {
    console.error('Get active system media error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์ระบบที่ใช้งานอยู่' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - เปลี่ยนสถานะไฟล์เป็นใช้งาน
export async function PUT(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ของไฟล์' },
        { status: 400 }
      );
    }

    // Find the file
    const systemMedia = await prisma.systemMedia.findUnique({
      where: { id }
    });

    if (!systemMedia) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์ที่ต้องการ' },
        { status: 404 }
      );
    }

    // Deactivate all files of the same type
    await prisma.systemMedia.updateMany({
      where: { 
        type: systemMedia.type,
        isActive: true 
      },
      data: { isActive: false }
    });

    // Activate the selected file
    const updatedMedia = await prisma.systemMedia.update({
      where: { id },
      data: { isActive: true }
    });

    return NextResponse.json({
      success: true,
      message: `เปิดใช้งาน${systemMedia.type === 'logo' ? 'โลโก้' : systemMedia.type === 'background' ? 'ภาพพื้นหลัง' : 'favicon'}สำเร็จ`,
      data: updatedMedia
    });

  } catch (error) {
    console.error('Activate system media error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเปิดใช้งานไฟล์ระบบ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
