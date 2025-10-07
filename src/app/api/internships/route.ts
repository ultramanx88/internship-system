import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'internship' หรือ 'co_op'
    const lang = (searchParams.get('lang') || 'th').toLowerCase();
    
    console.log('Internships API - Fetching internships, type:', type);
    
    const whereClause = type ? { type: type as any } : {};
    
    const internships = await prisma.internship.findMany({
      where: whereClause,
      include: {
        company: true
      },
      orderBy: {
        title: 'asc'
      }
    });
    
    console.log('Internships API - Found internships:', internships.length);
    
    const items = internships.map((i: any) => ({
      ...i,
      title: lang === 'en' ? (i.titleEn || i.title) : i.title,
      description: lang === 'en' ? (i.descriptionEn || i.description) : i.description,
      company: i.company ? {
        ...i.company,
        name: lang === 'en' ? (i.company.nameEn || i.company.name) : i.company.name,
        description: lang === 'en' ? (i.company.descriptionEn || i.company.description) : i.company.description,
        industry: lang === 'en' ? (i.company.industryEn || i.company.industry) : i.company.industry,
        address: lang === 'en' ? (i.company.addressEn || i.company.address) : i.company.address,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      internships: items
    });
  } catch (error) {
    console.error('Internships API - Error fetching internships:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch internships',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, companyId, location, description, type } = body;
    
    console.log('Internships API - Creating internship:', { title, companyId, type });
    
    // Validation
    if (!title || !companyId || !location || !description || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const internship = await prisma.internship.create({
      data: {
        title,
        companyId,
        location,
        description,
        type
      },
      include: {
        company: true
      }
    });
    
    console.log('Internships API - Created internship:', internship.id);
    
    return NextResponse.json({
      success: true,
      internship
    });
  } catch (error) {
    console.error('Internships API - Error creating internship:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create internship',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}