import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'th').toLowerCase();
    const includeRelations = searchParams.get('include') === 'true';

    const faculties = await prisma.faculty.findMany({
      where: {
        isActive: true,
      },
      include: includeRelations ? {
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
          },
        },
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      } : {
        _count: {
          select: {
            departments: true,
            users: true,
          },
        },
      },
      orderBy: {
        nameTh: 'asc',
      },
    });

    const items = faculties.map((f) => ({
      ...f,
      label: lang === 'en' ? (f.nameEn || f.nameTh) : f.nameTh,
      departments: f.departments?.map((d: any) => ({
        ...d,
        label: lang === 'en' ? (d.nameEn || d.nameTh) : d.nameTh,
        curriculums: d.curriculums?.map((c: any) => ({
          ...c,
          label: lang === 'en' ? (c.nameEn || c.nameTh) : c.nameTh,
          majors: c.majors?.map((m: any) => ({
            ...m,
            label: lang === 'en' ? (m.nameEn || m.nameTh) : m.nameTh,
          })),
        })),
      })),
    }));

    return NextResponse.json({
      faculties: items,
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await cleanup();
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

    const body = await request.json();
    
    // Sanitize input
    const sanitizedBody = sanitizeUserInput(body);
    if (!sanitizedBody.isValid) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: sanitizedBody.errors },
        { status: 400 }
      );
    }
    
    const { nameTh, nameEn, code } = sanitizedBody.sanitized;
    const sanitizedNameTh = sanitizeString(nameTh);
    const sanitizedNameEn = nameEn ? sanitizeString(nameEn) : null;
    const sanitizedCode = code ? sanitizeString(code) : null;

    if (!sanitizedNameTh) {
      return NextResponse.json(
        { error: 'ชื่อคณะ (ภาษาไทย) เป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if faculty with same name already exists
    const existingFaculty = await prisma.faculty.findFirst({
      where: { nameTh: sanitizedNameTh },
    });

    if (existingFaculty) {
      return NextResponse.json(
        { error: 'คณะนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const faculty = await prisma.faculty.create({
      data: {
        nameTh: sanitizedNameTh,
        nameEn: sanitizedNameEn,
        code: sanitizedCode,
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

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}