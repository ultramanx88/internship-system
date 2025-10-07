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

    // Upcoming deadlines and recent activities will be fetched from real tables in future; return empty arrays for now
    const upcomingDeadlines: any[] = [];
    const recentActivities: any[] = [];

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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
