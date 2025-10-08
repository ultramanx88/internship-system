import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup-service';
import { AdminGuard } from '@/components/auth/PermissionGuard';

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { backupId, restoreTo, includeMedia, includeLogs } = await request.json();

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    await backupService.restoreBackup({
      backupId,
      restoreTo: restoreTo || 'local',
      includeMedia: includeMedia || false,
      includeLogs: includeLogs || false,
    });

    return NextResponse.json({ message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
