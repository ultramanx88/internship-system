import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');
    const lang = (searchParams.get('lang') || 'th').toLowerCase();

    if (!provinceId) {
      return NextResponse.json(
        { success: false, error: 'Province ID is required' },
        { status: 400 }
      );
    }

    const districts = await prisma.district.findMany({
      where: { 
        provinceId,
        isActive: true 
      },
      orderBy: { nameTh: 'asc' },
      select: {
        id: true,
        nameTh: true,
        nameEn: true,
        code: true,
        provinceId: true
      }
    });

    const items = districts.map((d) => ({
      id: d.id,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      code: d.code,
      provinceId: d.provinceId,
      label: lang === 'en' ? (d.nameEn || d.nameTh) : d.nameTh,
    }));

    return NextResponse.json({
      success: true,
      districts: items
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

