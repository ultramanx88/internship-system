import { NextResponse } from 'next/server';
import { internships } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json(internships);
  } catch (error) {
    console.error('Failed to fetch internships:', error);
    return NextResponse.json({ message: 'Failed to fetch internships' }, { status: 500 });
  }
}
