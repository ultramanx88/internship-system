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

    await prisma.major.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting major:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete major' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}


