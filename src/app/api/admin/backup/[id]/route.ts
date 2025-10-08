import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup-service';
import { AdminGuard } from '@/components/auth/PermissionGuard';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const backup = await backupService.getBackup(params.id);
    
    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Failed to get backup:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve backup' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await backupService.deleteBackup(params.id);

    return NextResponse.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
