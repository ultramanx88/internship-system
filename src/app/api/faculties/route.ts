
import { NextResponse } from 'next/server';
import { faculties as mockFaculties } from '@/lib/data';

// GET: Fetch all faculties
export async function GET() {
  try {
    // For this demo, we use mock data to avoid database dependency.
    return NextResponse.json(mockFaculties);

  } catch (error) {
    console.error('Failed to fetch faculties:', error);
    return NextResponse.json({ message: 'Failed to fetch faculties' }, { status: 500 });
  }
}

// POST: Create, Update, or Delete faculties
export async function POST(request: Request) {
  try {
    const incomingFaculties = await request.json();

    if (!Array.isArray(incomingFaculties)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // For demo purposes, we'll just return the sent data as if it were saved.
    // This simulates a successful database transaction.
    return NextResponse.json({ message: 'Faculties updated successfully (Simulated)', data: incomingFaculties });
    
  } catch (error) {
    console.error('Failed to update faculties:', error);
    return NextResponse.json({ message: 'Failed to update faculties' }, { status: 500 });
  }
}
