import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { id } = await params;
    
    console.log('Company API - Fetching company:', id, 'by:', user.name);
    
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        // normalized refs for address labels
        provinceRef: {
          select: { id: true, nameTh: true, nameEn: true, code: true }
        },
        districtRef: {
          select: { id: true, nameTh: true, nameEn: true, code: true, provinceId: true }
        },
        subdistrictRef: {
          select: { id: true, nameTh: true, nameEn: true, code: true, postalCode: true, districtId: true }
        },
        internships: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            type: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    console.log('Company API - Found company:', company.name);
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Company API - Error fetching company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch company',
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
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      nameEn,
      phone, 
      email, 
      website, 
      address,
      province,
      district,
      subdistrict,
      provinceId,
      districtId,
      subdistrictId,
      postalCode,
      description,
      industry,
      size 
    } = body;

    console.log('Company API - Updating company:', id, 'by:', user.name);

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name || undefined,
        nameEn: nameEn || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        address: address || undefined,
        province: province || undefined,
        district: district || undefined,
        subdistrict: subdistrict || undefined,
        // New ID refs for normalized address
        provinceIdRef: provinceId || undefined,
        districtIdRef: districtId || undefined,
        subdistrictIdRef: subdistrictId || undefined,
        postalCode: postalCode || undefined,
        description: description || undefined,
        industry: industry || undefined,
        size: size || undefined,
      },
      include: {
        internships: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            type: true
          }
        }
      }
    });
    
    console.log('Company API - Updated company:', company.name);
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Company API - Error updating company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update company',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}