import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      include: {
        academicYear: true
      },
      orderBy: [
        { academicYear: { year: 'desc' } },
        { semester: 'asc' }
      ]
    });

    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}
