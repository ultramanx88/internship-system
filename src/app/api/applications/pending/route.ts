import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Require admin or staff access
    const authResult = await requireAuth(request, ['admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc'; // desc = ล่าสุดก่อน, asc = เก่าสุดก่อน
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = { status: 'pending' };

    if (search) {
      whereClause.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { internship: { company: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              major: { select: { id: true, nameTh: true, nameEn: true } }
            }
          },
          internship: { include: { company: true } }
        },
        orderBy: { dateApplied: sort === 'desc' ? 'desc' : 'asc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Failed to fetch pending applications:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to fetch pending applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await cleanup();
  }
}