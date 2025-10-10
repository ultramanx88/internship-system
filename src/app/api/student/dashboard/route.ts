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

    // Get student's applications with related data (internal-only fields)
    const applications = await prisma.application.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        printRecord: true,
      },
      orderBy: {
        dateApplied: 'desc',
      },
    });

    // Determine currently approved/accepted application by new enums
    const approvedApplication = applications.find(app =>
      ['committee_approved', 'company_accepted', 'internship_started', 'internship_ongoing', 'internship_completed', 'completed']
        .includes(app.status as any)
    );

    // Upcoming deadlines and recent activities will be fetched from real tables in future; return empty arrays for now
    const upcomingDeadlines: any[] = [];
    const recentActivities: any[] = [];

    // Get statistics
    const stats = {
      totalApplications: applications.length,
      approvedApplications: applications.filter(app =>
        ['committee_approved', 'company_accepted', 'internship_started', 'internship_ongoing', 'internship_completed', 'completed']
          .includes(app.status as any)
      ).length,
      pendingApplications: applications.filter(app =>
        ['submitted', 'course_instructor_pending', 'course_instructor_approved', 'committee_pending', 'committee_partially_approved', 'documents_prepared', 'awaiting_external_response']
          .includes(app.status as any)
      ).length,
      completedApplications: applications.filter(app => app.status === 'completed' || app.status === 'internship_completed').length,
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
