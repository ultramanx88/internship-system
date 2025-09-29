import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Faculty } from '@/lib/types';

// GET: Fetch all faculties from the database
export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      orderBy: {
        nameTh: 'asc',
      },
    });
    return NextResponse.json(faculties);
  } catch (error) {
    console.error('Failed to fetch faculties:', error);
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: Create, Update, or Delete faculties in the database
export async function POST(request: Request) {
  try {
    const incomingFaculties: Faculty[] = await request.json();

    if (!Array.isArray(incomingFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const currentFaculties = await prisma.faculty.findMany();
    const incomingIds = new Set(incomingFaculties.map(f => f.id));
    const currentIds = new Set(currentFaculties.map(f => f.id));

    const toDelete = currentFaculties.filter(f => !incomingIds.has(f.id));
    const toCreate = incomingFaculties.filter(f => f.id.startsWith('new-'));
    const toUpdate = incomingFaculties.filter(f => currentIds.has(f.id));
    
    // Using a transaction to ensure all operations succeed or none do
    const transaction = await prisma.$transaction([
      // Delete faculties that are no longer in the list
      prisma.faculty.deleteMany({
        where: { id: { in: toDelete.map(f => f.id) } },
      }),
      // Create new faculties
      ...toCreate.map(f => prisma.faculty.create({
        data: {
          nameTh: f.nameTh,
          nameEn: f.nameEn,
        }
      })),
      // Update existing faculties
      ...toUpdate.map(f => prisma.faculty.update({
        where: { id: f.id },
        data: {
          nameTh: f.nameTh,
          nameEn: f.nameEn,
        }
      }))
    ]);

    const updatedFaculties = await prisma.faculty.findMany({
       orderBy: {
        nameTh: 'asc',
      },
    });

    return NextResponse.json({ message: 'Faculties updated successfully', data: updatedFaculties });
  } catch (error) {
    console.error('Failed to update faculties:', error);
    return NextResponse.json({ message: 'Failed to update faculties' }, { status: 500 });
  }
}
