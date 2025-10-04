import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.courseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching course categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameEn, description } = body;

    const category = await prisma.courseCategory.create({
      data: {
        id: `cat_${Date.now()}`,
        name,
        nameEn,
        description,
        isActive: true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating course category:', error);
    return NextResponse.json(
      { error: 'Failed to create course category' },
      { status: 500 }
    );
  }
}
