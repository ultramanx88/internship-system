import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }

    // ดึงรายชื่ออาจารย์นิเทศก์ (role = 'visitor')
    const supervisors = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'visitor'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        t_name: true,
        t_surname: true,
        e_name: true,
        e_surname: true,
        phone: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      supervisors
    });
  } catch (error) {
    console.error('Course Instructor Supervisors API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supervisors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
