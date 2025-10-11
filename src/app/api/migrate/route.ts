import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // ตรวจสอบ secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'migrate-db-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting database migration check...');

    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    await prisma.$connect();
    
    // ทดสอบการ query
    const userCount = await prisma.user.count();
    // const companyCount = await prisma.company.count(); // Company model removed
    const internshipCount = await prisma.internship.count();
    const applicationCount = await prisma.application.count();

    return NextResponse.json({
      message: 'Database connection successful',
      status: 'connected',
      counts: {
        users: userCount,
        companies: companyCount,
        internships: internshipCount,
        applications: applicationCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}