import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET() {
  try {
    const majors = await prisma.major.findMany({
      include: {
        curriculum: {
          include: {
            department: {
              include: {
                faculty: true
              }
            }
          }
        }
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({
      success: true, 
      majors 
    });
  } catch (error) {
    console.error('Error fetching majors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch majors' },
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
    const majors = await request.json();
    
    // Process each major
    for (const major of majors) {
      if (major.id.startsWith('new-')) {
        // Create new major
        await prisma.major.create({
          data: {
            nameTh: major.nameTh,
            nameEn: major.nameEn,
            curriculumId: major.curriculumId,
            area: major.area,
            isActive: major.isActive !== false
          }
        });
      } else {
        // Update existing major
        await prisma.major.update({
          where: { id: major.id },
          data: {
            nameTh: major.nameTh,
            nameEn: major.nameEn,
            curriculumId: major.curriculumId,
            area: major.area,
            isActive: major.isActive !== false
          }
        });
      }
    }

    // Fetch updated data
    const updatedMajors = await prisma.major.findMany({
      include: {
        curriculum: {
          include: {
            department: {
              include: {
                faculty: true
              }
            }
          }
        }
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedMajors 
    });
  } catch (error) {
    console.error('Error saving majors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save majors' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}