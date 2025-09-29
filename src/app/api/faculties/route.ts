import { NextResponse } from 'next/server';
import { faculties } from '@/lib/data';
import type { Faculty } from '@/lib/types';

// GET: Fetch all faculties from the mock data
export async function GET() {
  try {
    // In a real app, this would fetch from a database.
    // For now, we return the mock data.
    const sortedFaculties = [...faculties].sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
    return NextResponse.json(sortedFaculties);
  } catch (error) {
    console.error('Failed to fetch faculties:', error);
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: "Update" faculties in the mock data store
export async function POST(request: Request) {
  try {
    const updatedFaculties: Faculty[] = await request.json();

    if (!Array.isArray(updatedFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // This is a "batch" or "bulk" update simulation.
    const newFaculties: Faculty[] = [];
    
    updatedFaculties.forEach(faculty => {
        const existingIndex = faculties.findIndex(f => f.id === faculty.id);
        if (existingIndex !== -1) {
            // Update existing faculty
            faculties[existingIndex] = { ...faculties[existingIndex], ...faculty };
            newFaculties.push(faculties[existingIndex]);
        } else {
            // Add new faculty with a permanent-looking ID
            const newFaculty = { ...faculty, id: `f-${Date.now()}-${Math.random()}` };
            faculties.push(newFaculty);
            newFaculties.push(newFaculty);
        }
    });

    return NextResponse.json({ message: 'Faculties updated successfully', data: newFaculties });
  } catch (error) {
    console.error('Failed to update faculties:', error);
    return NextResponse.json({ message: 'Failed to update faculties' }, { status: 500 });
  }
}
