import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      provinces
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
