import { NextResponse } from 'next/server';
import { faculties } from '@/lib/data';
import type { Faculty } from '@/lib/types';

// In-memory data store for demonstration
let facultyData: Faculty[] = [...faculties];

// GET: Fetch all faculties
export async function GET() {
  try {
    // In a real application, you would fetch data from a database.
    // For now, we return the mock data.
    return NextResponse.json(facultyData);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: Create or update faculties
export async function POST(request: Request) {
  try {
    const updatedFaculties: Faculty[] = await request.json();

    if (!Array.isArray(updatedFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // In a real application, you would perform validation and then
    // update or insert records into your database.
    // For this mock API, we'll just replace the in-memory array.
    facultyData = updatedFaculties;

    console.log('Updated faculties data:', facultyData);

    return NextResponse.json({ message: 'Faculties updated successfully', data: facultyData });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update faculties' }, { status: 500 });
  }
}
