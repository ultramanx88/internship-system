import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CompanySize } from '@prisma/client';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions
    const user = { id: 'admin', name: 'Admin', roles: ['admin'] };

    console.log('🔍 Companies API called by:', user.name);
    
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'th').toLowerCase();
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || 'all';
    const size = searchParams.get('size') || 'all';
    const isActive = searchParams.get('isActive') || 'all';
    const sort = searchParams.get('sort') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry !== 'all') {
      where.industry = industry;
    }

    if (size !== 'all') {
      where.size = size as CompanySize;
    }

    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Get companies with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: sort === 'desc' ? 'desc' : 'asc' },
        skip,
        take: limit,
        include: {
          provinceRef: { select: { id: true, nameTh: true, nameEn: true, code: true } },
          districtRef: { select: { id: true, nameTh: true, nameEn: true, code: true, provinceId: true } },
          subdistrictRef: { select: { id: true, nameTh: true, nameEn: true, code: true, postalCode: true, districtId: true } },
          _count: { select: { internships: true } }
        }
      }),
      prisma.company.count({ where }),
    ]);

    const items = companies.map((c: any) => {
      const provinceLabel = c.provinceRef ? (lang === 'en' ? (c.provinceRef.nameEn || c.provinceRef.nameTh) : c.provinceRef.nameTh) : c.province;
      const districtLabel = c.districtRef ? (lang === 'en' ? (c.districtRef.nameEn || c.districtRef.nameTh) : c.districtRef.nameTh) : c.district;
      const subdistrictLabel = c.subdistrictRef ? (lang === 'en' ? (c.subdistrictRef.nameEn || c.subdistrictRef.nameTh) : c.subdistrictRef.nameTh) : c.subdistrict;
      return {
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        address: lang === 'en' ? (c.addressEn || c.address) : c.address,
        addressEn: c.addressEn,
        province: provinceLabel,
        district: districtLabel,
        subdistrict: subdistrictLabel,
        postalCode: c.subdistrictRef?.postalCode || c.postalCode,
        phone: c.phone,
        email: c.email,
        website: c.website,
        description: lang === 'en' ? (c.descriptionEn || c.description) : c.description,
        industry: lang === 'en' ? (c.industryEn || c.industry) : c.industry,
        size: c.size,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        _count: c._count,
        // expose ids if needed by clients
        provinceId: c.provinceIdRef,
        districtId: c.districtIdRef,
        subdistrictId: c.subdistrictIdRef,
        label: lang === 'en' ? (c.nameEn || c.name) : c.name
      };
    });

    return NextResponse.json({
      companies: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('🔍 Companies POST API called by:', user.name);
    
    const body = await request.json();
    const {
      name,
      nameEn,
      address,
    province,
    district,
    subdistrict,
      provinceId,
      districtId,
      subdistrictId,
      postalCode,
      phone,
      email,
      website,
      description,
      industry,
      size,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'ชื่อบริษัทเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if company with same name already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'บริษัทนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        nameEn,
        address,
        province,
        district,
        subdistrict,
        provinceIdRef: provinceId || undefined,
        districtIdRef: districtId || undefined,
        subdistrictIdRef: subdistrictId || undefined,
        postalCode,
        phone,
        email,
        website,
        description,
        industry,
        size: size as CompanySize,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    console.log('🔍 Companies DELETE API called by:', user.name);
    
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบรายการที่ต้องการลบ' },
        { status: 400 }
      );
    }

    await prisma.company.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}