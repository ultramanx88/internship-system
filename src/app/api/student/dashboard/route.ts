import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['student']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('Student Dashboard API - Fetching data for user:', user.id);

    // Get student's applications with related data
    const applications = await prisma.application.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        internship: {
          include: {
            company: true,
          },
        },
        printRecord: true,
      },
      orderBy: {
        dateApplied: 'desc',
      },
    });

    // Get approved application
    const approvedApplication = applications.find(app => app.status === 'approved');
    
    // Get upcoming deadlines (mock data for now)
    const upcomingDeadlines = [
      {
        id: '1',
        title: 'ส่งรายงานความคืบหน้า',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        type: 'report',
        priority: 'high',
      },
      {
        id: '2',
        title: 'ส่งแบบประเมินสถานประกอบการ',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        type: 'evaluation',
        priority: 'medium',
      },
    ];

    // Get recent activities (mock data for now)
    const recentActivities = [
      {
        id: '1',
        type: 'application',
        message: 'ส่งใบสมัครฝึกงานเรียบร้อยแล้ว',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'success',
      },
      {
        id: '2',
        type: 'approval',
        message: 'ใบสมัครได้รับการอนุมัติ',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'success',
      },
    ];

    // Get statistics
    const stats = {
      totalApplications: applications.length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      completedApplications: applications.filter(app => app.status === 'completed').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        applications,
        approvedApplication,
        upcomingDeadlines,
        recentActivities,
        stats,
      },
    });
  } catch (error) {
    console.error('Student Dashboard API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
