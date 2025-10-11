import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'demo_users_toggle' }
    });

    return NextResponse.json({
      enabled: setting?.value === 'true' || false,
      setting
    });
  } catch (error) {
    console.error('Error fetching demo users toggle setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();

    const setting = await prisma.systemSettings.upsert({
      where: { key: 'demo_users_toggle' },
      update: {
        value: enabled ? 'true' : 'false',
        updatedAt: new Date()
      },
      create: {
        key: 'demo_users_toggle',
        value: enabled ? 'true' : 'false',
        description: 'Toggle for demo users dropdown visibility',
        category: 'ui',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error updating demo users toggle setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
