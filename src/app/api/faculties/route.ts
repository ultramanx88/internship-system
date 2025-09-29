import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Faculty } from '@/lib/types';

// GET: Fetch all faculties from the database
export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(faculties);
  } catch (error) {
    console.error('Failed to fetch faculties:', error);
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: Create or update faculties in the database
export async function POST(request: Request) {
  try {
    const updatedFaculties: Faculty[] = await request.json();

    if (!Array.isArray(updatedFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // This is a "batch" or "bulk" update. 
    // It will update existing faculties and create new ones.
    const transaction = updatedFaculties.map((faculty) => {
      // If the ID is a temporary one from the client, it won't be found, so Prisma creates a new one.
      // If the ID exists, Prisma updates it.
      return prisma.faculty.upsert({
        where: { id: faculty.id },
        update: {
          nameTh: faculty.nameTh,
          nameEn: faculty.nameEn,
        },
        create: {
          nameTh: faculty.nameTh,
          nameEn: faculty.nameEn,
        },
      });
    });

    const result = await prisma.$transaction(transaction);

    return NextResponse.json({ message: 'Faculties updated successfully', data: result });
  } catch (error) {
    console.error('Failed to update faculties:', error);
    return NextResponse.json({ message: 'Failed to update faculties' }, { status: 500 });
  }
}
