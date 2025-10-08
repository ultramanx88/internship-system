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

    const { searchParams } = new URL(request.url);
    const logType = searchParams.get('type') as 'system' | 'audit' || 'system';
    const level = searchParams.get('level') as any;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const filters: any = {};
    if (level) filters.level = level;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    filters.limit = limit;
    filters.offset = offset;

    const result = await enhancedLogger.getLogs(logType, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Cleanup old logs
    await enhancedLogger.cleanupOldLogs();

    return NextResponse.json({ message: 'Logs cleaned up successfully' });
  } catch (error) {
    console.error('Failed to cleanup logs:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup logs' },
      { status: 500 }
    );
  }
}
