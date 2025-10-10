import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { calculateCommitteeApprovalStatus } from '@/lib/application-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['committee']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && (!notes || !notes.trim())) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุเหตุผลในการไม่อนุมัติ' },
        { status: 400 }
      );
    }

    // หาคณะกรรมการที่กรรมการนี้เป็นสมาชิก
    const committeeMembership = await prisma.committeeMember.findFirst({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        committee: true
      }
    });

    if (!committeeMembership) {
      return NextResponse.json(
        { success: false, error: 'คุณไม่ใช่กรรมการ' },
        { status: 403 }
      );
    }

    // อัปเดตหรือสร้างการพิจารณาของกรรมการ
    const committeeApproval = await prisma.applicationCommittee.upsert({
      where: {
        applicationId_committeeId: {
          applicationId: (await params).id,
          committeeId: committeeMembership.committeeId
        }
      },
      update: {
        status: status,
        notes: notes || null,
        reviewedAt: new Date()
      },
      create: {
        applicationId: (await params).id,
        committeeId: committeeMembership.committeeId,
        status: status,
        notes: notes || null,
        reviewedAt: new Date()
      },
      include: {
        committee: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // คำนวณสถานะรวมของกรรมการ (เกณฑ์อนุมัติ >= 3 คน)
    const approvalStatus = await calculateCommitteeApprovalStatus((await params).id);

    if (!approvalStatus.success) {
      return NextResponse.json(approvalStatus, { status: 500 });
    }

    // อัปเดตสถานะของ Application ตามผลรวม
    // ภายใน: ถ้าอนุมัติ >=3 ให้เป็น committee_approved และรอการดำเนินการของ staff
    let finalApplicationStatus = 'committee_pending';
    if (approvalStatus.isApproved) {
      finalApplicationStatus = 'committee_approved';
    } else if (approvalStatus.isRejected) {
      finalApplicationStatus = 'course_instructor_rejected';
    } else if (approvalStatus.approvedCount > 0) {
      finalApplicationStatus = 'committee_partially_approved';
    }

    await prisma.application.update({
      where: { id: (await params).id },
      data: {
        status: finalApplicationStatus,
        committeeApproved: approvalStatus.isApproved,
        committeeApprovedAt: approvalStatus.isApproved ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: `บันทึกการพิจารณาเรียบร้อย (${approvalStatus.approvedCount} อนุมัติ)`,
      committeeApproval,
      approvalStatus,
      finalStatus: finalApplicationStatus
    });
  } catch (error) {
    console.error('Committee Review API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถบันทึกการพิจารณาได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
