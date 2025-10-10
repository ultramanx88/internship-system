import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const TEST_PREFIX = 'TEST_ACAD_';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error as unknown as NextResponse;

    const now = Date.now();
    // Create sample hierarchy
    const faculty = await prisma.faculty.create({
      data: { nameTh: `${TEST_PREFIX}คณะ_${now}`, nameEn: `${TEST_PREFIX}Faculty_${now}`, code: `F-${now}` }
    });
    const department = await prisma.department.create({
      data: { nameTh: `${TEST_PREFIX}สาขา_${now}`, nameEn: `${TEST_PREFIX}Department_${now}`, code: `D-${now}`, facultyId: faculty.id }
    });
    const curriculum = await prisma.curriculum.create({
      data: { nameTh: `${TEST_PREFIX}หลักสูตร_${now}`, nameEn: `${TEST_PREFIX}Curriculum_${now}`, code: `C-${now}`, degree: 'ปริญญาตรี', departmentId: department.id }
    });
    const major = await prisma.major.create({
      data: { nameTh: `${TEST_PREFIX}วิชาเอก_${now}`, nameEn: `${TEST_PREFIX}Major_${now}`, curriculumId: curriculum.id, area: 'Test Area' }
    });

    return NextResponse.json({ success: true, data: { faculty, department, curriculum, major } });
  } catch (error) {
    console.error('Admin academic test create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create test data' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error as unknown as NextResponse;

    const faculties = await prisma.faculty.findMany({ where: { nameTh: { startsWith: TEST_PREFIX } }, include: { departments: { include: { curriculums: { include: { majors: true } } } } } });
    const counts = {
      faculties: faculties.length,
      departments: faculties.reduce((n, f) => n + f.departments.length, 0),
      curriculums: faculties.reduce((n, f) => n + f.departments.reduce((m, d) => m + d.curriculums.length, 0), 0),
      majors: faculties.reduce((n, f) => n + f.departments.reduce((m, d) => m + d.curriculums.reduce((k, c) => k + c.majors.length, 0), 0), 0)
    };

    return NextResponse.json({ success: true, counts, sample: faculties[0] || null });
  } catch (error) {
    console.error('Admin academic test verify error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify test data' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error as unknown as NextResponse;

    // Delete in order of dependencies
    const curriculums = await prisma.curriculum.findMany({ where: { nameTh: { startsWith: TEST_PREFIX } }, select: { id: true } });
    await prisma.major.deleteMany({ where: { curriculumId: { in: curriculums.map(c => c.id) } } });
    await prisma.curriculum.deleteMany({ where: { nameTh: { startsWith: TEST_PREFIX } } });

    const departments = await prisma.department.findMany({ where: { nameTh: { startsWith: TEST_PREFIX } }, select: { id: true } });
    await prisma.department.deleteMany({ where: { id: { in: departments.map(d => d.id) } } });

    await prisma.faculty.deleteMany({ where: { nameTh: { startsWith: TEST_PREFIX } } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin academic test cleanup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cleanup test data' }, { status: 500 });
  } finally {
    await cleanup();
  }
}


