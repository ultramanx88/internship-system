import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';

const createHolidaySchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อวันหยุด'),
  nameEn: z.string().optional(),
  date: z.string().min(1, 'ต้องระบุวันที่'),
  isActive: z.boolean().default(true)
});

const updateHolidaySchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อวันหยุด').optional(),
  nameEn: z.string().optional(),
  date: z.string().min(1, 'ต้องระบุวันที่').optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'th').toLowerCase();
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    console.log('Fetching holidays with whereClause:', whereClause);

    // Get holidays
    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.holiday.count({ where: whereClause });

    console.log('Found holidays:', holidays.length);

    const items = holidays.map((h) => ({
      ...h,
      name: lang === 'en' ? (h.nameEn || h.name) : h.name,
    }));

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch holidays',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions

    const body = await request.json();

    // Bulk save path from admin/settings: { holidays }
    if (Array.isArray(body?.holidays)) {
      const holidays: any[] = body.holidays;

      // Upsert holidays by id (if present) otherwise create new
      for (const h of holidays) {
        const data = {
          name: h.name ?? '',
          nameEn: h.nameEn ?? null,
          date: h.date ? new Date(h.date) : new Date(),
          isActive: Boolean(h.isActive)
        } as const;

        if (h.id && typeof h.id === 'string' && !h.id.startsWith('new-')) {
          await prisma.holiday.update({ where: { id: h.id }, data });
        } else {
          // Create new holiday
          await prisma.holiday.create({ data });
        }
      }

      return NextResponse.json({ success: true, message: 'บันทึกข้อมูลวันหยุดสำเร็จ' });
    }

    // Single create path
    const result = createHolidaySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: result.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { name, nameEn, date, isActive } = result.data;

    const holiday = await prisma.holiday.create({
      data: {
        name,
        nameEn,
        date: new Date(date),
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: holiday,
      message: 'สร้างวันหยุดเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error creating holiday:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create holiday',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
