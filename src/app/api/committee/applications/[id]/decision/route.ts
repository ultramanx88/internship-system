import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { decision, comments } = await request.json();

    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Update application with committee decision
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        committeeDecision: decision,
        committeeComments: comments || null,
        // If approved, update status
        ...(decision === 'approve' && {
          status: 'อนุมัติแล้ว',
          pendingCommitteeReview: false
        }),
        // If rejected, update status
        ...(decision === 'reject' && {
          status: 'ต้องแก้ไข',
          pendingCommitteeReview: false
        })
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create committee approval record
    await prisma.committeeApproval.create({
      data: {
        applicationId: applicationId,
        committeeId: 'committee-1', // This should be the actual committee member ID
        decision: decision,
        comments: comments || null,
        approvedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Committee decision saved successfully',
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        committeeDecision: updatedApplication.committeeDecision,
        committeeComments: updatedApplication.committeeComments
      }
    });

  } catch (error) {
    console.error('Error saving committee decision:', error);
    return NextResponse.json(
      { error: 'Failed to save committee decision' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

