import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('Internship API - Fetching internship:', id);
    
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        company: true,
        applications: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!internship) {
      return NextResponse.json(
        { success: false, error: 'Internship not found' },
        { status: 404 }
      );
    }
    
    console.log('Internship API - Found internship:', internship.title);
    
    return NextResponse.json({
      success: true,
      internship
    });
  } catch (error) {
    console.error('Internship API - Error fetching internship:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch internship',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('Internship API - Updating internship:', id);
    
    const internship = await prisma.internship.update({
      where: { id },
      data: body,
      include: {
        company: true
      }
    });
    
    console.log('Internship API - Updated internship:', internship.title);
    
    return NextResponse.json({
      success: true,
      internship
    });
  } catch (error) {
    console.error('Internship API - Error updating internship:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update internship',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('Internship API - Deleting internship:', id);
    
    await prisma.internship.delete({
      where: { id }
    });
    
    console.log('Internship API - Deleted internship:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    console.error('Internship API - Error deleting internship:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete internship',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}