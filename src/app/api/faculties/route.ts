import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions
    const user = { id: 'admin', name: 'Admin', roles: ['admin'] };

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
    // Removed authentication check for internal admin functions
    const user = { id: 'admin', name: 'Admin', roles: ['admin'] };

    const body = await request.json();
    
    // Check if it's a bulk update (array) or single create
    if (Array.isArray(body)) {
      // Bulk update for hierarchical management
      for (const faculty of body) {
        if (faculty.id.startsWith('new-')) {
          // Create new faculty
          await prisma.faculty.create({
            data: {
              nameTh: faculty.nameTh,
              nameEn: faculty.nameEn,
              code: faculty.code,
              isActive: faculty.isActive !== false
            }
          });
        } else {
          // Update existing faculty
          await prisma.faculty.update({
            where: { id: faculty.id },
            data: {
              nameTh: faculty.nameTh,
              nameEn: faculty.nameEn,
              code: faculty.code,
              isActive: faculty.isActive !== false
            }
          });
        }
      }

      // Fetch updated data
      const updatedFaculties = await prisma.faculty.findMany({
        include: {
          departments: {
            include: {
              curriculums: {
                include: {
                  majors: true
                }
              }
            }
          }
        },
        orderBy: {
          nameTh: 'asc'
        }
      });

      return NextResponse.json({ 
        success: true, 
        data: updatedFaculties 
      });
    } else {
      // Single faculty creation (legacy support)
      const { nameTh, nameEn, code } = body;
      
      if (!nameTh) {
        return NextResponse.json(
          { error: 'ชื่อคณะ (ภาษาไทย) เป็นข้อมูลที่จำเป็น' },
          { status: 400 }
        );
      }

      // Check if faculty with same name already exists
      const existingFaculty = await prisma.faculty.findFirst({
        where: { nameTh: nameTh },
      });

      if (existingFaculty) {
        return NextResponse.json(
          { error: 'คณะนี้มีอยู่ในระบบแล้ว' },
          { status: 400 }
        );
      }

      const faculty = await prisma.faculty.create({
        data: {
          nameTh: nameTh,
          nameEn: nameEn,
          code: code,
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
    }
  } catch (error) {
    console.error('Error creating/updating faculty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}