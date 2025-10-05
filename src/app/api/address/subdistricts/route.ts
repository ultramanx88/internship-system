import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    if (!districtId) {
      return NextResponse.json(
        { success: false, error: 'District ID is required' },
        { status: 400 }
      );
    }

    const subdistricts = await prisma.subdistrict.findMany({
      where: { 
        districtId,
        isActive: true 
      },
      orderBy: { nameTh: 'asc' },
      select: {
        id: true,
        nameTh: true,
        nameEn: true,
        code: true,
        districtId: true,
        // เพิ่มรหัสไปรษณีย์สำหรับการตั้งค่าตามตำบลที่เลือก
        postalCode: true
      }
    });

    return NextResponse.json({
      success: true,
      subdistricts
    });
  } catch (error) {
    console.error('Error fetching subdistricts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subdistricts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

