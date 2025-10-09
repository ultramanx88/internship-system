import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/faculty-instructor-assignments?facultyId=&academicYearId=&semesterId=&isActive=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId') || undefined;
    const academicYearId = searchParams.get('academicYearId') || undefined;
    const semesterId = searchParams.get('semesterId') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === null ? undefined : isActiveParam === 'true';

    const where: any = {};
    if (facultyId) where.facultyId = facultyId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (semesterId) where.semesterId = semesterId;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const items = await prisma.facultyInstructorAssignment.findMany({
      where,
      include: {
        faculty: true,
        academicYear: true,
        semester: true,
        instructor: { select: { id: true, name: true, email: true, roles: true } }
      },
      orderBy: [{ updatedAt: 'desc' }]
    });
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch assignments', details: e?.message }, { status: 500 });
  }
}

// POST /api/faculty-instructor-assignments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facultyId, academicYearId, semesterId, instructorId, isActive = true, notes } = body || {};
    if (!facultyId || !academicYearId || !semesterId || !instructorId) {
      return NextResponse.json({ error: 'facultyId, academicYearId, semesterId, instructorId are required' }, { status: 400 });
    }

    // Ensure only one active assignment per (faculty, year, semester)
    const created = await prisma.$transaction(async (tx) => {
      // deactivate existing if creating active
      if (isActive) {
        await tx.facultyInstructorAssignment.updateMany({
          where: { facultyId, academicYearId, semesterId, isActive: true },
          data: { isActive: false }
        });
      }
      return tx.facultyInstructorAssignment.upsert({
        where: { facultyId_academicYearId_semesterId: { facultyId, academicYearId, semesterId } },
        create: { facultyId, academicYearId, semesterId, instructorId, isActive, notes },
        update: { instructorId, isActive, notes }
      });
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create assignment', details: e?.message }, { status: 500 });
  }
}

// PUT /api/faculty-instructor-assignments
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { facultyId, academicYearId, semesterId, instructorId, isActive, notes } = body || {};
    if (!facultyId || !academicYearId || !semesterId) {
      return NextResponse.json({ error: 'facultyId, academicYearId, semesterId are required' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isActive === true && instructorId) {
        await tx.facultyInstructorAssignment.updateMany({
          where: { facultyId, academicYearId, semesterId, isActive: true },
          data: { isActive: false }
        });
      }
      return tx.facultyInstructorAssignment.update({
        where: { facultyId_academicYearId_semesterId: { facultyId, academicYearId, semesterId } },
        data: { instructorId, isActive, notes }
      });
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update assignment', details: e?.message }, { status: 500 });
  }
}

// DELETE /api/faculty-instructor-assignments?facultyId=&academicYearId=&semesterId=
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');
    const academicYearId = searchParams.get('academicYearId');
    const semesterId = searchParams.get('semesterId');
    if (!facultyId || !academicYearId || !semesterId) {
      return NextResponse.json({ error: 'facultyId, academicYearId, semesterId are required' }, { status: 400 });
    }
    await prisma.facultyInstructorAssignment.delete({
      where: { facultyId_academicYearId_semesterId: { facultyId, academicYearId, semesterId } }
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete assignment', details: e?.message }, { status: 500 });
  }
}


