import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Health check - Starting...');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // ทดสอบ query ง่ายๆ
    console.log('🔍 Testing database query...');
    const userCount = await prisma.user.count();
    console.log('✅ Database query successful, user count:', userCount);
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Disconnect error:', disconnectError);
    }
  }
}