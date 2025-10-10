import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const TitleSchema = z.object({
  id: z.string().optional(),
  nameTh: z.string().min(1),
  nameEn: z.string().nullable().optional(),
  applicableTo: z.array(z.enum(['student', 'academic'])).default([]),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error;

    const titles = await prisma.title.findMany({
      orderBy: { nameTh: 'asc' }
    });

    return NextResponse.json({ success: true, data: titles });
  } catch (error) {
    console.error('GET /api/titles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch titles' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

// Bulk upsert
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error;

    const body = await request.json();

    if (!Array.isArray(body)) {
      const parsed = TitleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      }
      const { id, nameTh, nameEn, applicableTo, isActive } = parsed.data;
      if (id) {
        const updated = await prisma.title.update({
          where: { id },
          data: { nameTh, nameEn: nameEn ?? null, applicableTo, isActive: isActive ?? true }
        });
        return NextResponse.json({ success: true, data: updated });
      }
      const created = await prisma.title.create({
        data: { nameTh, nameEn: nameEn ?? null, applicableTo, isActive: isActive ?? true }
      });
      return NextResponse.json({ success: true, data: created });
    }

    const array = body as unknown[];
    for (const item of array) {
      const parsed = TitleSchema.safeParse(item);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Invalid input in array', details: parsed.error.flatten() }, { status: 400 });
      }
      const { id, nameTh, nameEn, applicableTo, isActive } = parsed.data;
      if (id && !id.startsWith('new-')) {
        await prisma.title.update({
          where: { id },
          data: { nameTh, nameEn: nameEn ?? null, applicableTo, isActive: isActive ?? true }
        });
      } else {
        await prisma.title.create({
          data: { nameTh, nameEn: nameEn ?? null, applicableTo, isActive: isActive ?? true }
        });
      }
    }

    const updated = await prisma.title.findMany({ orderBy: { nameTh: 'asc' } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('POST /api/titles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save titles' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await prisma.title.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/titles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete title' }, { status: 500 });
  } finally {
    await cleanup();
  }
}


