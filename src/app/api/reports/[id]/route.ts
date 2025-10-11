import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('Reports API - Fetching report:', id);
    
    // Since report model doesn't exist, return 404
    return NextResponse.json(
      { 
        success: false, 
        error: 'Report not found',
        details: 'Report model does not exist in current schema'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching report:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, status } = body;

    console.log('Reports API - Updating report:', id);
    
    // Since report model doesn't exist, return 404
    return NextResponse.json(
      { 
        success: false, 
        error: 'Report not found',
        details: 'Report model does not exist in current schema'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error updating report:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('Reports API - Deleting report:', id);
    
    // Since report model doesn't exist, return 404
    return NextResponse.json(
      { 
        success: false, 
        error: 'Report not found',
        details: 'Report model does not exist in current schema'
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting report:', error);
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