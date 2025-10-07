import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'th').toLowerCase();
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      orderBy: { nameTh: 'asc' },
      select: {
        id: true,
        nameTh: true,
        nameEn: true,
        code: true
      }
    });

    const items = provinces.map((p) => ({
      id: p.id,
      nameTh: p.nameTh,
      nameEn: p.nameEn,
      code: p.code,
      label: lang === 'en' ? (p.nameEn || p.nameTh) : p.nameTh,
    }));

    return NextResponse.json({
      success: true,
      provinces: items
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

