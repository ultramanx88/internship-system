import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: { year: 'desc' }
    });

    return NextResponse.json(academicYears);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { academicYears, semesters } = await request.json();

    // Update academic years
    for (const year of academicYears) {
      if (year.id.startsWith('new-')) {
        // Create new academic year
        await prisma.academicYear.create({
          data: {
            year: year.year,
            isActive: year.isActive
          }
        });
      } else {
        // Update existing academic year
        await prisma.academicYear.update({
          where: { id: year.id },
          data: {
            year: year.year,
            isActive: year.isActive
          }
        });
      }
    }

    // Update semesters
    for (const semester of semesters) {
      if (semester.id.startsWith('new-')) {
        // Create new semester
        await prisma.semester.create({
          data: {
            academicYearId: semester.academicYearId,
            semester: semester.semester,
            name: semester.name,
            startDate: new Date(semester.startDate),
            endDate: new Date(semester.endDate),
            isActive: semester.isActive
          }
        });
      } else {
        // Update existing semester
        await prisma.semester.update({
          where: { id: semester.id },
          data: {
            academicYearId: semester.academicYearId,
            semester: semester.semester,
            name: semester.name,
            startDate: new Date(semester.startDate),
            endDate: new Date(semester.endDate),
            isActive: semester.isActive
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving academic data:', error);
    return NextResponse.json(
      { error: 'Failed to save academic data' },
      { status: 500 }
    );
  }
}
