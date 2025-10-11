import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Removed authentication check for internal admin functions
    const user = { id: 'admin', name: 'Admin', roles: ['admin'] };

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    console.log('Notifications API - Fetching notifications', {
      byUserId: user.id,
      byUserName: user.name,
      page,
      limit,
      unreadOnly
    });

    // Get notifications from the database
    const whereClause: any = {};
    if (unreadOnly) {
      whereClause.read = false;
    }

    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: whereClause })
    ]);
    
    console.log('Notifications API - Found notifications:', notifications.length, 'total:', total);
    
    return NextResponse.json({
      success: true,
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Notifications API - Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      message, 
      type = 'info', 
      userId, 
      data = {} 
    } = body;

    console.log('Notifications API - Creating notification:', { title, type, userId });
    
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: userId || 'system',
        data: JSON.stringify(data),
        read: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Notifications API - Created notification:', notification.id);
    
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read = true } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    console.log('Notifications API - Updating notification:', { id, read });
    
    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Notifications API - Updated notification:', notification.id);
    
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}