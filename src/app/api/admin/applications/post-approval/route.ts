import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['staff', 'admin']);
    if ('error' in authResult) {
      return authResult.error;
    }

    // ดึงคำขอที่ได้รับการอนุมัติจากกรรมการแล้ว
    const applications = await prisma.application.findMany({
      where: {
        committeeStatus: 'approved',
        status: {
          in: [
            'committee_approved',
            'awaiting_external_response',
            'company_accepted',
            'internship_started',
            'internship_ongoing',
            'internship_completed',
            'completed'
          ]
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        // Internal-only fields
        internshipDocuments: {
          select: {
            id: true,
            type: true,
            title: true,
            fileUrl: true,
            generatedAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching post-approval applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
