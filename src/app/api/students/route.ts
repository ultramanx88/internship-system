import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff']);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const role = (searchParams.get('role') || 'students+educators').toLowerCase();

    const roleFilters: any[] = [];
    const addRoleContains = (r: string) => roleFilters.push({ roles: { contains: `"${r}"` } });

    if (role === 'student' || role === 'students' || role === 'students+educators') {
      addRoleContains('student');
    }
    if (role === 'educator' || role === 'educators' || role === 'students+educators') {
      addRoleContains('courseInstructor');
      addRoleContains('committee');
      addRoleContains('visitor');
      addRoleContains('อาจารย์ประจำวิชา');
      addRoleContains('อาจารย์นิเทศ');
      addRoleContains('กรรมการ');
    }

    const where: any = roleFilters.length > 0 ? { OR: roleFilters } : {};
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
        { t_name: { contains: search } },
        { t_surname: { contains: search } },
        { e_name: { contains: search } },
        { e_surname: { contains: search } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
        select: {
          id: true, name: true, email: true, roles: true,
          t_title: true, t_name: true, t_middle_name: true, t_surname: true,
          e_title: true, e_name: true, e_middle_name: true, e_surname: true,
          studentYear: true,
        }
      })
    ]);

    const normalized = users.map(u => ({ ...u, roles: (() => { try { return JSON.parse(u.roles); } catch { return ['student']; } })() }));

    return NextResponse.json({ users: normalized, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return NextResponse.json({ message: 'failed to fetch students' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

