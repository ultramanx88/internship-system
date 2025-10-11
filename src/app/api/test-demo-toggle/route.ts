import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Demo toggle API is working',
      enabled: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test demo toggle API:', error);
    return NextResponse.json(
      { error: 'Failed to test demo toggle' },
      { status: 500 }
    );
  }
}
