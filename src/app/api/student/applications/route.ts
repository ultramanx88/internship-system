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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Student Applications API - Fetching applications for user:', user.id);

    const whereClause: any = {
      studentId: user.id,
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      }),
      prisma.application.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Student Applications API Error:', error);
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['student']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { 
      internshipId, 
      studentReason, 
      expectedSkills, 
      preferredStartDate, 
      availableDuration,
      projectProposal 
    } = body;

    console.log('Student Applications API - Creating application for user:', user.id);

    // Validation
    if (!internshipId || !studentReason || !preferredStartDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: internshipId, studentReason, preferredStartDate' 
        },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: user.id,
        internshipId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Already applied to this internship' 
        },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: user.id,
        internshipId,
        status: 'pending',
        dateApplied: new Date(),
        feedback: studentReason,
        projectTopic: projectProposal,
      },
      include: {
        internship: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: application,
    }, { status: 201 });
  } catch (error) {
    console.error('Student Applications API Error:', error);
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
