import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Company API - Fetching company:', id);
    
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        province: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true
          }
        },
        district: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true
          }
        },
        subdistrict: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true,
            postalCode: true
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
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      nameEn, 
      phone, 
      email, 
      website, 
      addressNumber, 
      building, 
      floor, 
      soi, 
      road, 
      provinceId, 
      districtId, 
      subdistrictId, 
      postalCode, 
      mapUrl 
    } = body;
    
    console.log('Company API - Updating company:', id);
    
    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name || undefined,
        nameEn: nameEn || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        addressNumber: addressNumber || undefined,
        building: building || undefined,
        floor: floor || undefined,
        soi: soi || undefined,
        road: road || undefined,
        provinceId: provinceId || undefined,
        districtId: districtId || undefined,
        subdistrictId: subdistrictId || undefined,
        postalCode: postalCode || undefined,
        mapUrl: mapUrl || undefined,
      },
      include: {
        province: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true
          }
        },
        district: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true
          }
        },
        subdistrict: {
          select: {
            id: true,
            nameTh: true,
            nameEn: true,
            code: true,
            postalCode: true
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
    await prisma.$disconnect();
  }
}