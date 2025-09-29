import { NextResponse } from 'next/server';
import { applications } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
  }
}
