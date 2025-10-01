import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: {
        departments: {
          where: { isActive: true },
          include: {
            curriculums: {
              where: { isActive: true },
              include: {
                majors: {
                  where: { isActive: true },
                },
              },
            },
            _count: {
              select: {
                curriculums: true,
                users: true,
              },
            },
          },
        },
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคณะ' },
        { status: 404 }
      );
    }

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
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
    const { nameTh, nameEn, code, isActive } = body;

    if (!nameTh) {
      return NextResponse.json(
        { error: 'ชื่อคณะ (ภาษาไทย) เป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id: params.id },
    });

    if (!existingFaculty) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคณะ' },
        { status: 404 }
      );
    }

    // Check if another faculty with same name exists (excluding current faculty)
    const duplicateFaculty = await prisma.faculty.findFirst({
      where: {
        nameTh,
        id: { not: params.id },
      },
    });

    if (duplicateFaculty) {
      return NextResponse.json(
        { error: 'คณะนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: {
        nameTh,
        nameEn,
        code,
        isActive,
      },
      include: {
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error updating faculty:', error);
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
    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
    });

    if (!existingFaculty) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลคณะ' },
        { status: 404 }
      );
    }

    // Check if faculty has departments or users
    if (existingFaculty._count.departments > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบคณะที่มีสาขาอยู่ได้' },
        { status: 400 }
      );
    }

    if (existingFaculty._count.users > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบคณะที่มีนักศึกษาอยู่ได้' },
        { status: 400 }
      );
    }

    await prisma.faculty.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}