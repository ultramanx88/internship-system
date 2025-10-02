import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Debug API called');
    
    // Test database connection
    await prisma.$connect();
    const userCount = await prisma.user.count();
    
    // Test specific user
    const testUser = await prisma.user.findFirst({
      where: {
        email: 'ultramanx88@gmail.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true
      }
    });
    
    return NextResponse.json({
      status: 'success',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
      database: {
        connected: true,
        userCount,
        testUser: testUser ? {
          name: testUser.name,
          email: testUser.email,
          roles: testUser.roles
        } : null
      }
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      }
    }, { status: 500 });
  }
}