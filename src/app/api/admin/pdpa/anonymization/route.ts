import { NextRequest, NextResponse } from 'next/server';
import { pdpaService } from '@/lib/pdpa-service';
import { AdminGuard } from '@/components/auth/PermissionGuard';

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await AdminGuard.checkPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rules = await pdpaService.getAnonymizationRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Failed to get anonymization rules:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve anonymization rules' },
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

    const { tableName, columnName, anonymizationType, maskPattern } = await request.json();

    if (!tableName || !columnName || !anonymizationType) {
      return NextResponse.json(
        { error: 'tableName, columnName, and anonymizationType are required' },
        { status: 400 }
      );
    }

    await pdpaService.createAnonymizationRule({
      tableName,
      columnName,
      anonymizationType,
      maskPattern,
    });

    return NextResponse.json({ message: 'Anonymization rule created successfully' });
  } catch (error) {
    console.error('Failed to create anonymization rule:', error);
    return NextResponse.json(
      { error: 'Failed to create anonymization rule' },
      { status: 500 }
    );
  }
}
