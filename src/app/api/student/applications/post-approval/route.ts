import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    // ดึงคำขอของนักศึกษาที่ได้รับการอนุมัติแล้ว
    const applications = await prisma.application.findMany({
      where: {
        studentId: user.id,
        status: {
          in: [
            'company_accepted',
            'internship_started',
            'internship_ongoing',
            'internship_completed',
            'completed'
          ]
        }
      },
      include: {
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        companyResponses: {
          select: {
            id: true,
            status: true,
            responseDate: true,
            responseNote: true
          }
        },
        internshipDocuments: {
          select: {
            id: true,
            type: true,
            title: true,
            fileUrl: true,
            generatedAt: true
          }
        },
        weeklyReports: {
          select: {
            id: true,
            weekNumber: true,
            reportDate: true,
            content: true,
            attachments: true
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
    console.error('Error fetching student post-approval applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
