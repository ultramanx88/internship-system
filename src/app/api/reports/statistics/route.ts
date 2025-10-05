import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff', 'visitor', 'courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('Reports Statistics API - Fetching statistics by:', user.name);

    // Base where clause for role-based filtering
    let whereClause: any = {};
    
    if (user.roles.includes('visitor')) {
      whereClause.supervisorId = user.id;
    } else if (user.roles.includes('courseInstructor')) {
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

    // Get statistics
    const [
      totalReports,
      reportsByStatus,
      reportsByMonth,
      averageScore,
      topStudents,
      recentReports
    ] = await Promise.all([
      // Total reports count
      prisma.report.count({ where: whereClause }),
      
      // Reports by status
      prisma.report.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        }
      }),
      
      // Reports by month (last 12 months)
      prisma.report.groupBy({
        by: ['createdAt'],
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Average evaluation score
      prisma.evaluation.aggregate({
        where: {
          report: whereClause
        },
        _avg: {
          score: true
        }
      }),
      
      // Top students by report count
      prisma.report.groupBy({
        by: ['studentId'],
        where: whereClause,
        _count: {
          studentId: true
        },
        orderBy: {
          _count: {
            studentId: 'desc'
          }
        },
        take: 5
      }),
      
      // Recent reports
      prisma.report.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          },
          application: {
            include: {
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    // Process monthly data
    const monthlyData = reportsByMonth.map(item => ({
      month: item.createdAt.toISOString().substring(0, 7),
      count: item._count.id
    }));

    // Get student names for top students
    const topStudentsWithNames = await Promise.all(
      topStudents.map(async (item) => {
        const student = await prisma.user.findUnique({
          where: { id: item.studentId },
          select: { name: true }
        });
        return {
          studentId: item.studentId,
          studentName: student?.name || 'Unknown',
          reportCount: item._count.studentId
        };
      })
    );

    const statistics = {
      totalReports,
      reportsByStatus: reportsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      monthlyData,
      averageScore: averageScore._avg.score || 0,
      topStudents: topStudentsWithNames,
      recentReports: recentReports.map(report => ({
        id: report.id,
        title: report.title,
        status: report.status,
        studentName: report.student.name,
        companyName: report.application.internship.company.name,
        createdAt: report.createdAt
      }))
    };

    console.log('Reports Statistics API - Generated statistics');

    return NextResponse.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Reports Statistics API - Error fetching statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
