import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const lang = (searchParams.get('lang') || 'th').toLowerCase();

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

    const items = subdistricts.map((s) => ({
      id: s.id,
      nameTh: s.nameTh,
      nameEn: s.nameEn,
      code: s.code,
      districtId: s.districtId,
      postalCode: s.postalCode,
      label: lang === 'en' ? (s.nameEn || s.nameTh) : s.nameTh,
    }));

    return NextResponse.json({
      success: true,
      subdistricts: items
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

