import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['committee']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'pending_receipt';

    console.log('Committee Applications API - Fetching data for user:', user.id, 'action:', action);

    let whereClause: any = {};

    switch (action) {
      case 'pending_receipt':
        // คำขอที่รอการพิจารณา (ส่งไปยังกรรมการแล้ว)
        whereClause = {
          status: 'course_instructor_approved'
        };
        break;
      case 'my_applications':
        // คำขอที่กรรมการนี้เกี่ยวข้อง - simplified for current schema
        whereClause = {
          status: { in: ['course_instructor_approved', 'committee_approved', 'documents_prepared'] }
        };
        break;
      case 'approvals':
        // คำขอที่กรรมการนี้พิจารณาแล้ว
        whereClause = {
          status: { in: ['committee_approved', 'documents_prepared'] }
        };
        break;
      default:
        whereClause = {
          status: 'course_instructor_approved'
        };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        documentStatus: true,
        dateApplied: true,
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
        }
      },
      orderBy: {
        dateApplied: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Committee Applications API Error:', error);
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