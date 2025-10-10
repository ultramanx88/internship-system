import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const applicationId = (await params).id;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedApplication = {
      id: application.id,
      studentId: application.student.id,
      studentName: application.student.name,
      studentEmail: application.student.email,
      studentPhone: application.student.phone,
      companyName: application.internship?.company?.name || 'ไม่ระบุ',
      companyAddress: application.internship?.company?.address,
      companyPhone: application.internship?.company?.phone,
      position: application.internship?.position || 'ไม่ระบุ',
      type: application.internship?.type || 'internship',
      status: application.status,
      dateApplied: application.dateApplied.toISOString(),
      currentApprovals: application.committeeApprovals?.length || 0,
      requiredApprovals: 3, // Default required approvals
      pendingCommitteeReview: application.pendingCommitteeReview,
      studentReason: application.studentReason,
      expectedSkills: application.expectedSkills,
      projectProposal: application.projectProposal,
      preferredStartDate: application.preferredStartDate?.toISOString(),
      availableDuration: application.availableDuration,
      feedback: application.feedback,
      committeeDecision: application.committeeDecision,
      committeeComments: application.committeeComments,
      faculty: application.student.faculty?.name,
      department: application.student.department?.name,
      major: application.student.major?.name
    };

    return NextResponse.json(transformedApplication);

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

