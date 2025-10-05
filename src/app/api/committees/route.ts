import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2567';
    const semester = searchParams.get('semester') || '1';
    const includeMembers = searchParams.get('includeMembers') === 'true';

    const committees = await prisma.committee.findMany({
      where: {
        academicYear: academicYear,
        semester: semester,
        isActive: true
      },
      include: includeMembers ? {
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
        }
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      committees: committees
    });

  } catch (error) {
    console.error('Error fetching committees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch committees', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameEn, description, academicYear, semester, memberIds } = body;

    // สร้าง Committee
    const committee = await prisma.committee.create({
      data: {
        name,
        nameEn,
        description,
        academicYear,
        semester,
        isActive: true
      }
    });

    // เพิ่มสมาชิก
    if (memberIds && memberIds.length > 0) {
      for (let i = 0; i < memberIds.length; i++) {
        const userId = memberIds[i];
        const role = i === 0 ? 'chair' : i === 1 ? 'secretary' : 'member';
        
        await prisma.committeeMember.create({
          data: {
            committeeId: committee.id,
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
      message: 'Committee created successfully'
    });

  } catch (error) {
    console.error('Error creating committee:', error);
    return NextResponse.json(
      { error: 'Failed to create committee', details: (error as Error).message },
      { status: 500 }
    );
  }
}
