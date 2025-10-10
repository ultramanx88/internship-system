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
          status: 'assigned_committee'
        };
        break;
      case 'my_applications':
        // คำขอที่กรรมการนี้เกี่ยวข้อง
        whereClause = {
          committees: {
            some: {
              committee: {
                members: {
                  some: {
                    userId: user.id
                  }
                }
              }
            }
          }
        };
        break;
      case 'approvals':
        // คำขอที่กรรมการนี้พิจารณาแล้ว
        whereClause = {
          committees: {
            some: {
              committee: {
                members: {
                  some: {
                    userId: user.id
                  }
                }
              },
              status: {
                in: ['approved', 'rejected']
              }
            }
          }
        };
        break;
      default:
        whereClause = {
          status: 'assigned_committee'
        };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
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
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        committees: {
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
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true
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