import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // Find the application with its print record
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: true,
        internship: {
          include: {
            company: true,
          },
        },
        printRecords: {
          orderBy: {
            printedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'ไม่พบเอกสารที่ต้องการ' },
        { status: 404 }
      );
    }

    if (application.printRecords.length === 0) {
      return NextResponse.json(
        { error: 'เอกสารนี้ยังไม่เคยถูกพิมพ์' },
        { status: 400 }
      );
    }

    const printRecord = application.printRecords[0];

    // Log reprint activity (optional)
    console.log(`Reprinting document ${printRecord.documentNumber} for application ${applicationId}`);

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        studentName: application.student.name,
        companyName: application.internship.company.name,
        documentNumber: printRecord.documentNumber,
        documentDate: printRecord.documentDate,
      },
      message: 'พิมพ์ซ้ำเอกสารสำเร็จ',
    });
  } catch (error) {
    console.error('Error reprinting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}