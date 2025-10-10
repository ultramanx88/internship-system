import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true,
            major: {
              select: {
                id: true,
                nameTh: true,
                nameEn: true
              }
            },
            faculty: {
              select: {
                id: true,
                nameTh: true,
                nameEn: true
              }
            }
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำขอฝึกงาน' },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์
    if (application.courseInstructorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงคำขอนี้' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Course Instructor Application Detail API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch application details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
