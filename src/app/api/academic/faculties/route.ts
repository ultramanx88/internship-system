import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Academic API - Fetching faculties with relations');
    
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            curriculums: {
              include: {
                majors: true
              }
            }
          }
        }
      },
      orderBy: {
        nameTh: 'asc'
      }
    });
    
    console.log('Academic API - Found faculties:', faculties.length);
    
    return NextResponse.json({
      success: true,
      faculties
    });
  } catch (error) {
    console.error('Academic API - Error fetching faculties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch faculties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}