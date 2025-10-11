import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions
    const user = { id: 'admin', name: 'Admin', roles: ['admin'] };

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Companies API called by:', user.name);
    
    const whereClause: any = {};
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          companyName: { contains: search, mode: 'insensitive' }
        },
        {
          companyRegNumber: { contains: search, mode: 'insensitive' }
        }
      ];
    }

    const skip = (page - 1) * limit;
    
    // Get unique companies from applications
    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        id: true,
        companyName: true,
        companyRegNumber: true,
        companyPhone: true,
        addressNumber: true,
        provinceId: true,
        districtId: true,
        subdistrictId: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        status: true,
        dateApplied: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dateApplied: sort === 'desc' ? 'desc' : 'asc'
      },
      skip,
      take: limit
    });

    // Group by company name to get unique companies
    const companyMap = new Map();
    applications.forEach(app => {
      if (app.companyName) {
        const key = app.companyName.toLowerCase().trim();
        if (!companyMap.has(key)) {
          companyMap.set(key, {
            id: `company_${key.replace(/\s+/g, '_')}`,
            name: app.companyName,
            regNumber: app.companyRegNumber,
            phone: app.companyPhone,
            address: app.addressNumber,
            province: app.provinceId,
            district: app.districtId,
            subdistrict: app.subdistrictId,
            postalCode: app.postalCode,
            latitude: app.latitude,
            longitude: app.longitude,
            applications: []
          });
        }
        companyMap.get(key).applications.push({
          id: app.id,
          status: app.status,
          dateApplied: app.dateApplied,
          student: app.student
        });
      }
    });

    const companies = Array.from(companyMap.values());
    const total = companyMap.size;
    
    console.log('Companies API - Found companies:', companies.length, 'total:', total);
    
    return NextResponse.json({
      success: true,
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch companies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name,
      regNumber,
      phone,
      addressNumber,
      provinceId,
      districtId,
      subdistrictId,
      postalCode,
      latitude,
      longitude
    } = body;

    console.log('Companies API - Creating company:', { name });
    
    // Since we don't have a Company model, we'll create a placeholder application
    // that represents the company registration
    const application = await prisma.application.create({
      data: {
        studentId: 'system', // System-generated company record
        status: 'company_registered',
        dateApplied: new Date(),
        projectTopic: `Company Registration: ${name}`,
        companyName: name,
        companyRegNumber: regNumber,
        companyPhone: phone,
        addressNumber: addressNumber,
        provinceId: provinceId,
        districtId: districtId,
        subdistrictId: subdistrictId,
        postalCode: postalCode,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null
      },
      select: {
        id: true,
        companyName: true,
        companyRegNumber: true,
        companyPhone: true,
        addressNumber: true,
        provinceId: true,
        districtId: true,
        subdistrictId: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        status: true,
        dateApplied: true
      }
    });
    
    console.log('Companies API - Created company record:', application.id);
    
    return NextResponse.json({
      success: true,
      company: {
        id: `company_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name: application.companyName,
        regNumber: application.companyRegNumber,
        phone: application.companyPhone,
        address: application.addressNumber,
        province: application.provinceId,
        district: application.districtId,
        subdistrict: application.subdistrictId,
        postalCode: application.postalCode,
        latitude: application.latitude,
        longitude: application.longitude,
        status: application.status,
        dateApplied: application.dateApplied
      }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create company',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
