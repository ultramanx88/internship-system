import { NextRequest, NextResponse } from 'next/server';
import { enhancedLogger } from '@/lib/enhanced-logger';
import { AdminGuard } from '@/components/auth/PermissionGuard';

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get retention policies
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const policies = await prisma.logRetentionPolicy.findMany({
      orderBy: { logType: 'asc' },
    });

    await prisma.$disconnect();

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Failed to get retention policies:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve retention policies' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { logType, retentionDays } = await request.json();

    if (!logType || !retentionDays || retentionDays < 1) {
      return NextResponse.json(
        { error: 'Invalid logType or retentionDays' },
        { status: 400 }
      );
    }

    await enhancedLogger.updateRetentionPolicy(logType, retentionDays);

    return NextResponse.json({ message: 'Retention policy updated successfully' });
  } catch (error) {
    console.error('Failed to update retention policy:', error);
    return NextResponse.json(
      { error: 'Failed to update retention policy' },
      { status: 500 }
    );
  }
}
