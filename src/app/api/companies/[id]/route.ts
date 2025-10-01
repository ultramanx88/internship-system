import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CompanySize } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        internships: {
          include: {
            applications: true,
          },
        },
        _count: {
          select: {
            internships: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลบริษัท' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      address,
      province,
      district,
      subdistrict,
      postalCode,
      phone,
      email,
      website,
      description,
      industry,
      size,
      isActive,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'ชื่อบริษัทเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลบริษัท' },
        { status: 404 }
      );
    }

    // Check if another company with same name exists (excluding current company)
    const duplicateCompany = await prisma.company.findFirst({
      where: {
        name,
        id: { not: params.id },
      },
    });

    if (duplicateCompany) {
      return NextResponse.json(
        { error: 'บริษัทนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        nameEn,
        address,
        province,
        district,
        subdistrict,
        postalCode,
        phone,
        email,
        website,
        description,
        industry,
        size: size as CompanySize,
        isActive,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลบริษัท' },
        { status: 404 }
      );
    }

    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}