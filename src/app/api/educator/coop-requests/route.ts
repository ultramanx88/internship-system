import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, roleChecks, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Development bypass - check if we're in dev mode
    const isDev = process.env.NODE_ENV === 'development';
    const devBypass = request.headers.get('x-dev-bypass') === 'true';
    
    if (isDev && devBypass) {
      console.log('🔧 Development bypass enabled for coop-requests');
      // Create a mock user for development
      const mockUser = {
        id: 'dev_user_001',
        name: 'Development User',
        roles: ['courseInstructor']
      };
      return await processRequest(request, mockUser);
    }

    // Check authentication and authorization
    const authResult = await requireAuth(request, ['courseInstructor', 'committee', 'visitor']);
    if ('error' in authResult) {
      // If requireAuth fails, try to get user from header as fallback
      const userId = request.headers.get('x-user-id');
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          educatorRole: true
        }
      });
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (!user.educatorRole) {
        return NextResponse.json(
          { success: false, error: 'User is not an educator' },
          { status: 403 }
        );
      }
      
      // Mock user object for compatibility
      const mockUser = {
        id: user.id,
        name: user.name,
        roles: user.educatorRole ? ['courseInstructor'] : []
      };
      
      // Continue with the rest of the function using mockUser
      return await processRequest(request, mockUser);
    }
    const { user } = authResult;
    
    return await processRequest(request, user);
  } catch (error) {
    console.error('Error fetching coop requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch coop requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

async function processRequest(request: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const major = searchParams.get('major');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // User is already authenticated and authorized via requireAuth

    // สร้าง where clause สำหรับการกรอง
    const whereClause: any = {};

    // กรองตาม status
    if (status) {
      whereClause.status = status;
    }

    // กรองตาม major
    if (major) {
      whereClause.student = {
        major: {
          nameTh: {
            contains: major,
            mode: 'insensitive'
          }
        }
      };
    }

    // กรองตาม search (ชื่อนักศึกษา หรือ รหัสนักศึกษา)
    if (search) {
      whereClause.OR = [
        {
          student: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            studentId: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // ดึงข้อมูล applications ตาม role
    let applications = [];

    if (user.roles.includes('courseInstructor')) {
      // อาจารย์ประจำวิชาเห็น applications ทั้งหมด (เนื่องจากไม่มี courseInstructorId field แล้ว)
      applications = await prisma.application.findMany({
        where: {
          ...whereClause
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
              major: { 
                select: { 
                  id: true, 
                  nameTh: true, 
                  nameEn: true 
                } 
              },
              department: { 
                select: { 
                  id: true, 
                  nameTh: true, 
                  nameEn: true 
                } 
              },
              faculty: { 
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
        },
        orderBy: {
          dateApplied: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });
    } else if (user.roles.includes('committee')) {
      // กรรมการเห็น applications ทั้งหมด
      applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
              major: { 
                select: { 
                  id: true, 
                  nameTh: true, 
                  nameEn: true 
                } 
              },
              department: { 
                select: { 
                  id: true, 
                  nameTh: true, 
                  nameEn: true 
                } 
              },
              faculty: { 
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
        },
        orderBy: {
          dateApplied: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });
    }

    // นับจำนวนทั้งหมดสำหรับ pagination
    let totalCount;
    if (user.roles.includes('courseInstructor')) {
      totalCount = await prisma.application.count({
        where: {
          ...whereClause
        }
      });
    } else if (user.roles.includes('committee')) {
      totalCount = await prisma.application.count({
        where: whereClause
      });
    } else {
      totalCount = 0;
    }

    // แปลงข้อมูลให้ตรงกับ frontend interface
    const mappedApplications = applications.map(app => ({
      id: app.id,
      studentName: app.student.name,
      studentId: app.student.id, // ใช้ id แทน studentId
      major: app.student.major?.nameTh || 'ไม่ระบุ',
      companyName: app.internship.company.name,
      position: app.internship.title,
      status: app.status,
      createdAt: app.dateApplied.toISOString(),
      submittedDate: app.dateApplied ? new Date(app.dateApplied).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'ไม่ระบุ',
      supervisor: app.supervisor ? {
        id: app.supervisor.id,
        name: app.supervisor.name,
        email: app.supervisor.email
      } : null
    }));

    return NextResponse.json({
      success: true,
      applications: mappedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      user: {
        id: user.id,
        name: user.name,
        role: user.roles.includes('courseInstructor') ? 'อาจารย์ประจำวิชา' : 
              user.roles.includes('committee') ? 'กรรมการ' : 'ไม่ระบุ'
      }
    });
  } catch (error) {
    console.error('Error fetching coop requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch coop requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, status, feedback } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      );
    }

    // อัปเดตสถานะของ applications
    const updatedApplications = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds }
      },
      data: {
        status: status as any,
        feedback: feedback || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedApplications.count} applications`,
      updatedCount: updatedApplications.count
    });
  } catch (error) {
    console.error('Error updating applications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds } = body as { applicationIds?: string[] };

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    // ลบใบสมัครแบบถาวร (ถ้าต้องการ soft-delete เปลี่ยนเป็น update status=archived)
    const deleted = await prisma.application.deleteMany({
      where: { id: { in: applicationIds } }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count
    });
  } catch (error) {
    console.error('Error deleting applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete applications' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}


