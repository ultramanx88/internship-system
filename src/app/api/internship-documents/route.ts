import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()(request);

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // ดึงรายการเอกสารของคำขอฝึกงาน
    const documents = await prisma.internshipDocument.findMany({
      where: {
        applicationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching internship documents:', error);
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
    const { applicationId, type, title, titleEn, content, fileUrl } = body;

    if (!applicationId || !type || !title) {
      return NextResponse.json(
        { error: 'Application ID, type, and title are required' },
        { status: 400 }
      );
    }

    // สร้างเอกสารใหม่
    const document = await prisma.internshipDocument.create({
      data: {
        applicationId,
        type,
        title,
        titleEn,
        content,
        fileUrl,
        generatedBy: user.id,
        status: 'approved'
      }
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'Document created successfully'
    });
  } catch (error) {
    console.error('Error creating internship document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
