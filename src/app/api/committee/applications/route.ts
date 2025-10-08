import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      if (status === 'pending') {
        where.pendingCommitteeReview = true;
      } else {
        where.status = status;
      }
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }

    // Fetch applications with related data
    const applications = await prisma.application.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            faculty: {
              select: {
                name: true,
                nameEn: true
              }
            },
            department: {
              select: {
                name: true,
                nameEn: true
              }
            },
            major: {
              select: {
                name: true,
                nameEn: true
              }
            }
          }
        },
        internship: {
          select: {
            company: {
              select: {
                name: true,
                nameEn: true,
                address: true,
                phone: true
              }
            },
            position: true,
            type: true
          }
        },
        committeeApprovals: {
          include: {
            committee: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        dateApplied: 'desc'
      },
      skip,
      take: limit
    });

    // Transform data for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      studentId: app.student.id,
      studentName: app.student.name,
      studentEmail: app.student.email,
      studentPhone: app.student.phone,
      companyName: app.internship?.company?.name || 'ไม่ระบุ',
      companyAddress: app.internship?.company?.address,
      companyPhone: app.internship?.company?.phone,
      position: app.internship?.position || 'ไม่ระบุ',
      type: app.internship?.type || 'internship',
      status: app.status,
      dateApplied: app.dateApplied.toISOString(),
      currentApprovals: app.committeeApprovals?.length || 0,
      requiredApprovals: 3, // Default required approvals
      pendingCommitteeReview: app.pendingCommitteeReview,
      studentReason: app.studentReason,
      expectedSkills: app.expectedSkills,
      projectProposal: app.projectProposal,
      preferredStartDate: app.preferredStartDate?.toISOString(),
      availableDuration: app.availableDuration,
      feedback: app.feedback,
      faculty: app.student.faculty?.name,
      department: app.student.department?.name,
      major: app.student.major?.name
    }));

    // Get total count for pagination
    const totalCount = await prisma.application.count({ where });

    return NextResponse.json({
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching committee applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

