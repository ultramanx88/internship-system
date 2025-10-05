import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff', 'visitor', 'courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('Report Details API - Fetching report:', id, 'by:', user.name);

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            major: {
              select: {
                nameTh: true,
                nameEn: true
              }
            },
            department: {
              select: {
                nameTh: true,
                nameEn: true
              }
            },
            faculty: {
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
            email: true,
            phone: true
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
                    nameEn: true,
                    address: true,
                    phone: true,
                    email: true,
                    website: true
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
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.roles.includes('visitor') && report.supervisorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    console.log('Report Details API - Found report:', report.id);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Report Details API - Error fetching report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff', 'visitor', 'courseInstructor']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { title, content, status, feedback } = body;

    console.log('Report Update API - Updating report:', id, 'by:', user.name);

    // Check if report exists and user has permission
    const existingReport = await prisma.report.findUnique({
      where: { id },
      select: { 
        id: true, 
        supervisorId: true, 
        studentId: true,
        status: true
      }
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.roles.includes('visitor') && existingReport.supervisorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (status) {
      updateData.status = status;
      if (status === 'submitted' && existingReport.status === 'draft') {
        updateData.submittedAt = new Date();
      }
      if (status === 'reviewed' && existingReport.status === 'submitted') {
        updateData.reviewedAt = new Date();
      }
    }
    if (feedback) updateData.feedback = feedback;

    const report = await prisma.report.update({
      where: { id },
      data: updateData,
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

    console.log('Report Update API - Updated report:', report.id);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Report Update API - Error updating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('Report Delete API - Deleting report:', id, 'by:', user.name);

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    await prisma.report.delete({
      where: { id }
    });

    console.log('Report Delete API - Deleted report:', id);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Report Delete API - Error deleting report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
