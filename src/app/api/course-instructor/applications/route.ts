import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'pending_receipt';

    console.log('Course Instructor Applications API - Fetching data for user:', user.id, 'action:', action);

    let whereClause: any = {};

    switch (action) {
      case 'pending_receipt':
        // คำขอที่รอรับ (ยังไม่ได้ assign courseInstructorId)
        whereClause = {
          courseInstructorId: null,
          status: 'course_instructor_pending'
        };
        break;
      case 'my_applications':
        // คำขอที่ฉันรับแล้ว
        whereClause = {
          courseInstructorId: user.id
        };
        break;
      case 'approved':
        // คำขอที่อนุมัติแล้ว
        whereClause = {
          courseInstructorId: user.id,
          status: 'course_instructor_approved'
        };
        break;
      case 'rejected':
        // คำขอที่ไม่อนุมัติ
        whereClause = {
          courseInstructorId: user.id,
          status: 'course_instructor_rejected'
        };
        break;
      default:
        whereClause = {
          courseInstructorId: user.id
        };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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
            }
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true
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
      },
      orderBy: {
        dateApplied: 'desc'
      }
    });

    // สำหรับ pending_receipt ให้ assign courseInstructorId ให้คำขอใหม่
    if (action === 'pending_receipt') {
      const updatePromises = applications.map(app => 
        prisma.application.update({
          where: { id: app.id },
          data: { courseInstructorId: user.id }
        })
      );
      await Promise.all(updatePromises);
    }

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Course Instructor Applications API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
