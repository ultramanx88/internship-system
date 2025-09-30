
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Faculty } from '@prisma/client';
import { faculties as mockFaculties } from '@/lib/data';

// GET: Fetch all faculties
export async function GET() {
  try {
    // In a real application, you would fetch from the database.
    // For this demo, we use mock data to avoid database dependency.
    // const faculties = await prisma.faculty.findMany({
    //   orderBy: {
    //     nameTh: 'asc',
    //   },
    // });
    // return NextResponse.json(faculties);
    
    // Return mock data
    return NextResponse.json(mockFaculties);

  } catch (error) {
    console.error('Failed to fetch faculties:', error);
    // Even if we switch to mock data, keep the error handling for future DB integration.
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: Create, Update, or Delete faculties in the database
export async function POST(request: Request) {
  try {
    const incomingFaculties: Omit<Faculty, 'createdAt' | 'updatedAt'>[] = await request.json();

    if (!Array.isArray(incomingFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // For demo purposes, we'll just return the sent data as if it were saved.
    // In a real application, the database transaction logic would be here.
    const currentFaculties = await prisma.faculty.findMany(); // This might fail if DB is not connected
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
    // If the database transaction fails, we can return a simulated success for the demo.
    console.error('Failed to update faculties (database might not be connected):', error);
    const body = await request.text();
    return NextResponse.json({ message: 'Faculties updated successfully (Simulated)', data: JSON.parse(body) });
  }
}
