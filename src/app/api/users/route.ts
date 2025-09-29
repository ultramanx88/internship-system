import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
