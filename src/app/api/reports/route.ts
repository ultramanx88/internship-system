import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff', 'visitor', 'courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Reports API - Fetching reports by:', user.name, 'search:', search, 'status:', status, 'page:', page);

    const whereClause: any = {};
    
    // Filter by status
    if (status !== 'all') {
      whereClause.status = status;
    }
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          title: { contains: search, mode: 'insensitive' }
        },
        {
          student: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          application: {
            internship: {
              company: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    // Role-based filtering
    if (user.roles.includes('visitor')) {
      // Supervisors see only their assigned reports
      whereClause.supervisorId = user.id;
    } else if (user.roles.includes('courseInstructor')) {
      // Course instructors see reports from their students
      whereClause.student = {
        major: {
          courseInstructors: {
            some: {
              userId: user.id
            }
          }
        }
      };
    }

    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              major: {
                select: {
                  nameTh: true,
                  nameEn: true
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
          },
          application: {
            include: {
              internship: {
                include: {
                  company: {
                    select: {
                      id: true,
                      name: true,
                      nameEn: true
                    }
                  }
                }
              }
            }
          },
          evaluations: {
            include: {
              evaluator: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: sort === 'desc' ? 'desc' : 'asc'
        },
        skip,
        take: limit
      }),
      prisma.report.count({ where: whereClause })
    ]);

    console.log('Reports API - Found reports:', reports.length, 'total:', total, 'execution time:', Date.now() - Date.now());

    return NextResponse.json({
      success: true,
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Reports API - Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reports',
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
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff', 'visitor', 'courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { 
      applicationId, 
      studentId, 
      supervisorId, 
      title, 
      content, 
      status = 'draft' 
    } = body;

    console.log('Reports API - Creating report by:', user.name);

    // Validation
    if (!applicationId || !studentId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has permission to create report for this student
    if (user.roles.includes('visitor') && supervisorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const report = await prisma.report.create({
      data: {
        applicationId,
        studentId,
        supervisorId: supervisorId || user.id,
        title,
        content,
        status,
        submittedAt: status === 'submitted' ? new Date() : null
      },
      include: {
        student: {
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
        },
        application: {
          include: {
            internship: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('Reports API - Created report:', report.id);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Reports API - Error creating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
