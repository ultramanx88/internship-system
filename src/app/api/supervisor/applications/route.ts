import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    // ดึงคำขอที่อาจารย์นิเทศก์ได้รับมอบหมาย
    const applications = await prisma.application.findMany({
      where: {
        supervisorId: user.id,
        status: {
          in: [
            'assigned_supervisor',
            'company_accepted',
            'internship_started',
            'internship_ongoing',
            'internship_completed'
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
        internship: {
          include: {
            company: {
              select: {
                name: true
              }
            }
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
    console.error('Error fetching supervisor applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
