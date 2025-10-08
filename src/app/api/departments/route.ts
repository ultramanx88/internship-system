import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        faculty: true,
        curriculums: {
          include: {
            majors: true
          }
        }
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      departments 
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
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
    const departments = await request.json();
    
    // Process each department
    for (const dept of departments) {
      if (dept.id.startsWith('new-')) {
        // Create new department
        await prisma.department.create({
          data: {
            nameTh: dept.nameTh,
            nameEn: dept.nameEn,
            code: dept.code,
            facultyId: dept.facultyId,
            isActive: dept.isActive !== false
          }
        });
      } else {
        // Update existing department
        await prisma.department.update({
          where: { id: dept.id },
          data: {
            nameTh: dept.nameTh,
            nameEn: dept.nameEn,
            code: dept.code,
            facultyId: dept.facultyId,
            isActive: dept.isActive !== false
          }
        });
      }
    }

    // Fetch updated data
    const updatedDepartments = await prisma.department.findMany({
      include: {
        faculty: true,
        curriculums: {
          include: {
            majors: true
          }
        }
      },
      orderBy: {
        nameTh: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedDepartments 
    });
  } catch (error) {
    console.error('Error saving departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save departments' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}