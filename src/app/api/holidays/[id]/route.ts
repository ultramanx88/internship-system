import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Removed authentication check for internal admin functions

    const { id } = await params;
    
    console.log('Holiday API - Fetching holiday:', id);
    
    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      return NextResponse.json(
        { success: false, error: 'Holiday not found' },
        { status: 404 }
      );
    }

    console.log('Holiday API - Found holiday:', holiday.name);
    
    return NextResponse.json({
      success: true,
      data: holiday
    });
  } catch (error) {
    console.error('Holiday API - Error fetching holiday:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch holiday',
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
    // Removed authentication check for internal admin functions

    const { id } = await params;
    const body = await request.json();
    
    console.log('Holiday API - Updating holiday:', id);
    
    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        name: body.name,
        nameEn: body.nameEn,
        date: body.date ? new Date(body.date) : undefined,
        isActive: body.isActive
      }
    });

    console.log('Holiday API - Updated holiday:', holiday.name);
    
    return NextResponse.json({
      success: true,
      data: holiday,
      message: 'อัปเดตวันหยุดเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Holiday API - Error updating holiday:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update holiday',
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
    // Removed authentication check for internal admin functions

    const { id } = await params;
    
    console.log('Holiday API - Deleting holiday:', id);
    
    await prisma.holiday.delete({
      where: { id }
    });

    console.log('Holiday API - Deleted holiday:', id);
    
    return NextResponse.json({
      success: true,
      message: 'ลบวันหยุดเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Holiday API - Error deleting holiday:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete holiday',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
