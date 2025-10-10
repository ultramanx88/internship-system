import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    // ดึงรายการการแจ้งเตือนของผู้ใช้
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // จำกัดจำนวนการแจ้งเตือนที่แสดง
    });

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // ทำเครื่องหมายการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // ทำเครื่องหมายการแจ้งเตือนที่เลือกเป็นอ่านแล้ว
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: user.id
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
