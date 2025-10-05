import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const committee = await prisma.committee.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        applications: {
          include: {
            application: {
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
              }
            }
          }
        }
      }
    });

    if (!committee) {
      return NextResponse.json({ error: 'Committee not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      committee: committee
    });

  } catch (error) {
    console.error('Error fetching committee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch committee', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, nameEn, description, memberIds } = body;

    // อัปเดต Committee
    const committee = await prisma.committee.update({
      where: { id },
      data: {
        name,
        nameEn,
        description
      }
    });

    // อัปเดตสมาชิก
    if (memberIds) {
      // ลบสมาชิกเก่า
      await prisma.committeeMember.deleteMany({
        where: { committeeId: id }
      });

      // เพิ่มสมาชิกใหม่
      for (let i = 0; i < memberIds.length; i++) {
        const userId = memberIds[i];
        const role = i === 0 ? 'chair' : i === 1 ? 'secretary' : 'member';
        
        await prisma.committeeMember.create({
          data: {
            committeeId: id,
            userId: userId,
            role: role,
            isActive: true
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      committee: committee,
      message: 'Committee updated successfully'
    });

  } catch (error) {
    console.error('Error updating committee:', error);
    return NextResponse.json(
      { error: 'Failed to update committee', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // ลบ Committee (จะลบ members และ applications ด้วยเนื่องจากมี onDelete: Cascade)
    await prisma.committee.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Committee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting committee:', error);
    return NextResponse.json(
      { error: 'Failed to delete committee', details: (error as Error).message },
      { status: 500 }
    );
  }
}
