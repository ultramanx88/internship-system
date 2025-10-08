import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(_request, ['admin', 'staff']);
    if ('error' in auth) return auth.error as unknown as NextResponse;
    const { id } = params;

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete department' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id: id },
      include: {
        faculty: true,
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
    });

    if (!department) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลสาขา' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nameTh, nameEn, code, facultyId, isActive } = body;

    if (!nameTh) {
      return NextResponse.json(
        { error: 'ชื่อสาขา (ภาษาไทย) เป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลสาขา' },
        { status: 404 }
      );
    }

    // If facultyId is provided, check if faculty exists
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return NextResponse.json(
          { error: 'ไม่พบคณะที่ระบุ' },
          { status: 404 }
        );
      }

      // Check if another department with same name exists in the target faculty
      const duplicateDepartment = await prisma.department.findFirst({
        where: {
          nameTh,
          facultyId,
          id: { not: id },
        },
      });

      if (duplicateDepartment) {
        return NextResponse.json(
          { error: 'สาขานี้มีอยู่ในคณะแล้ว' },
          { status: 400 }
        );
      }
    }

    const department = await prisma.department.update({
      where: { id: id },
      data: {
        nameTh,
        nameEn,
        code,
        ...(facultyId && { facultyId }),
        isActive,
      },
      include: {
        faculty: true,
        _count: {
          select: {
            curriculums: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            curriculums: true,
            users: true,
          },
        },
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลสาขา' },
        { status: 404 }
      );
    }

    // Check if department has curriculums or users
    if (existingDepartment._count.curriculums > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบสาขาที่มีหลักสูตรอยู่ได้' },
        { status: 400 }
      );
    }

    if (existingDepartment._count.users > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบสาขาที่มีนักศึกษาอยู่ได้' },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}