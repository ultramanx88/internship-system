import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    // Convert settings array to object for easier access
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        category: setting.category
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value, description, category } = await request.json();

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value,
        description,
        category,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description,
        category: category || 'general',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error updating system setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
