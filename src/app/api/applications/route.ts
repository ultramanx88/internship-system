import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const internshipId = searchParams.get('internshipId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('Applications API - Fetching applications by:', user.name, 'studentId:', studentId, 'internshipId:', internshipId);
    
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (internshipId) whereClause.internshipId = internshipId;
    if (status !== 'all') whereClause.status = status;
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          student: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          internship: {
            company: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
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
              e_surname: true
            }
          },
          internship: {
            include: {
              company: true
            }
          }
        },
        orderBy: {
          dateApplied: sort === 'desc' ? 'desc' : 'asc'
        },
        skip,
        take: limit
      }),
      prisma.application.count({ where: whereClause })
    ]);
    
    console.log('Applications API - Found applications:', applications.length, 'total:', total);
    
    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Applications API - Error fetching applications:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      internshipId, 
      studentReason, 
      expectedSkills, 
      preferredStartDate, 
      availableDuration,
      projectProposal,
      status = 'pending' // เพิ่ม status parameter
    } = body;
    
    console.log('Applications API - Creating application:', { studentId, internshipId, status });
    
    // Validation
    if (!studentId || !internshipId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าไม่ได้สมัครซ้ำ
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId,
        internshipId
      }
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Already applied to this internship' },
        { status: 409 }
      );
    }

    // หาอาจารย์ประจำวิชาที่เหมาะสม (ในระบบจริงจะใช้ logic ที่ซับซ้อนกว่า)
    const courseInstructor = await prisma.user.findFirst({
      where: {
        roles: {
          contains: 'courseInstructor'
        }
      }
    });

    const application = await prisma.application.create({
      data: {
        studentId,
        internshipId,
        courseInstructorId: courseInstructor?.id, // กำหนดอาจารย์ประจำวิชา
        status: status as any,
        dateApplied: new Date(),
        feedback: null,
        projectTopic: projectProposal || null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true
          }
        },
        internship: {
          include: {
            company: true
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Applications API - Created application:', application.id, 'assigned to instructor:', courseInstructor?.name);
    
    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Applications API - Error creating application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}