import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup-service';
import { AdminGuard } from '@/components/auth/PermissionGuard';

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const backups = await backupService.getBackups(limit);
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Failed to get backups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve backups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type, includeMedia, includeLogs, description } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Backup type is required' },
        { status: 400 }
      );
    }

    const backupId = await backupService.createBackup({
      type,
      includeMedia: includeMedia || false,
      includeLogs: includeLogs || false,
      description,
    });

    return NextResponse.json({ 
      message: 'Backup created successfully',
      backupId 
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
