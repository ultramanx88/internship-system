import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const major = searchParams.get('major');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลผู้ใช้และตรวจสอบว่าเป็น educator หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        major: { select: { id: true, nameTh: true, nameEn: true } },
        department: { select: { id: true, nameTh: true, nameEn: true } },
        faculty: { select: { id: true, nameTh: true, nameEn: true } }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Debug: ดูข้อมูล user และ roles
    console.log('🔍 User data:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      rolesType: typeof user.roles,
      rolesIsArray: Array.isArray(user.roles)
    });

    // ตรวจสอบว่าเป็น educator หรือไม่ (courseInstructor, committee)
    // รองรับทั้ง string และ array
    let userRoles = user.roles;
    if (typeof userRoles === 'string') {
      try {
        userRoles = JSON.parse(userRoles);
      } catch (e) {
        // ถ้า parse ไม่ได้ ให้ใช้ string เดิม
        userRoles = [userRoles];
      }
    }

    console.log('🔍 Parsed roles:', userRoles);

    const isEducator = userRoles.includes('courseInstructor') || 
                       userRoles.includes('committee') || 
                       userRoles.includes('อาจารย์ประจำวิชา') ||
                       userRoles.includes('อาจารย์นิเทศ') ||
                       userRoles.includes('กรรมการ');
    console.log('🔍 Is educator:', isEducator);

    if (!isEducator) {
      return NextResponse.json(
        { error: 'User is not an educator' },
        { status: 403 }
      );
    }

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

    if (userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา')) {
      // อาจารย์ประจำวิชาเห็นเฉพาะ applications ที่ถูกกำหนดให้ตน
      applications = await prisma.application.findMany({
        where: {
          courseInstructorId: userId,
          ...whereClause
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              id: true,
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
          courseInstructor: {
            select: {
              id: true,
              name: true,
              email: true
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
        },
        skip: (page - 1) * limit,
        take: limit
      });
    } else if (userRoles.includes('committee') || userRoles.includes('กรรมการ')) {
      // กรรมการเห็น applications ทั้งหมด
      applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              id: true,
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
          courseInstructor: {
            select: {
              id: true,
              name: true,
              email: true
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
        },
        skip: (page - 1) * limit,
        take: limit
      });
    }

    // นับจำนวนทั้งหมดสำหรับ pagination
    let totalCount;
    if (userRoles.includes('courseInstructor') || userRoles.includes('อาจารย์ประจำวิชา')) {
      totalCount = await prisma.application.count({
        where: {
          courseInstructorId: userId,
          ...whereClause
        }
      });
    } else if (userRoles.includes('committee') || userRoles.includes('กรรมการ')) {
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
    await prisma.$disconnect();
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
    await prisma.$disconnect();
  }
}


