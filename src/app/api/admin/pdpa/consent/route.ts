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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const consents = await pdpaService.getUserConsents(userId);
      return NextResponse.json(consents);
    } else {
      const stats = await pdpaService.getConsentStatistics();
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error('Failed to get consent data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve consent data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, consentType, isConsented, ipAddress, userAgent } = await request.json();

    if (!userId || !consentType) {
      return NextResponse.json(
        { error: 'userId and consentType are required' },
        { status: 400 }
      );
    }

    await pdpaService.recordConsent({
      userId,
      consentType,
      isConsented: isConsented || false,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ message: 'Consent recorded successfully' });
  } catch (error) {
    console.error('Failed to record consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const consentType = searchParams.get('consentType');

    if (!userId || !consentType) {
      return NextResponse.json(
        { error: 'userId and consentType are required' },
        { status: 400 }
      );
    }

    await pdpaService.withdrawConsent(userId, consentType);

    return NextResponse.json({ message: 'Consent withdrawn successfully' });
  } catch (error) {
    console.error('Failed to withdraw consent:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
      { status: 500 }
    );
  }
}
