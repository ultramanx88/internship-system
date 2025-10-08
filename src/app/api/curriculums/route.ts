import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET() {
  try {
    const curriculums = await prisma.curriculum.findMany({
      include: {
        department: {
          include: {
            faculty: true
          }
        },
        majors: true
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      curriculums 
    });
  } catch (error) {
    console.error('Error fetching curriculums:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch curriculums' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff']);
    if ('error' in auth) return auth.error as unknown as NextResponse;
    const curriculums = await request.json();
    
    // Process each curriculum
    for (const curr of curriculums) {
      if (curr.id.startsWith('new-')) {
        // Create new curriculum
        await prisma.curriculum.create({
          data: {
            nameTh: curr.nameTh,
            nameEn: curr.nameEn,
            code: curr.code,
            degree: curr.degree,
            departmentId: curr.departmentId,
            isActive: curr.isActive !== false
          }
        });
      } else {
        // Update existing curriculum
        await prisma.curriculum.update({
          where: { id: curr.id },
          data: {
            nameTh: curr.nameTh,
            nameEn: curr.nameEn,
            code: curr.code,
            degree: curr.degree,
            departmentId: curr.departmentId,
            isActive: curr.isActive !== false
          }
        });
      }
    }

    // Fetch updated data
    const updatedCurriculums = await prisma.curriculum.findMany({
      include: {
        department: {
          include: {
            faculty: true
          }
        },
        majors: true
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedCurriculums 
    });
  } catch (error) {
    console.error('Error saving curriculums:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save curriculums' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}