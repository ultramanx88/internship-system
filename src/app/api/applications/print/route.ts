import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateDocumentNumber } from "@/lib/document-number-allocator";

export async function GET() {
  try {
    // Get all approved applications with print status
    const applications = await prisma.application.findMany({
      where: {
        status: "approved",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            major: {
              select: { nameTh: true, nameEn: true }
            }
          }
        },
        internship: {
          include: {
            company: true,
          },
        },
        printRecord: true,
      },
      orderBy: {
        dateApplied: "desc",
      },
    });

    const formattedApplications = applications.map((app) => ({
      id: app.id,
      studentId: app.student.id,
      studentName: app.student.name,
      major: app.student.major?.nameTh || app.student.major?.nameEn || "-",
      companyName: app.internship.company.name,
      status: app.status,
      dateApplied: app.dateApplied.toISOString(),
      isPrinted: !!app.printRecord,
      printRecord: app.printRecord
        ? {
            id: app.printRecord.id,
            documentNumber: app.printRecord.documentNumber,
            documentDate: app.printRecord.documentDate.toISOString(),
            printedAt: app.printRecord.printedAt.toISOString(),
          }
        : undefined,
    }));

    return NextResponse.json({
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications for print:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, documentNumber, documentDate } = body;

    if (
      !applicationIds ||
      !Array.isArray(applicationIds) ||
      applicationIds.length === 0
    ) {
      return NextResponse.json(
        { error: "กรุณาเลือกเอกสารที่ต้องการพิมพ์" },
        { status: 400 }
      );
    }

    // If client does not provide a document number, allocate one atomically
    let finalDocumentNumber: string = documentNumber;
    if (!finalDocumentNumber) {
      const allocated = await allocateDocumentNumber({ digits: 5 });
      finalDocumentNumber = allocated.formatted;
    }
    if (!documentDate) {
      return NextResponse.json(
        { error: "กรุณากรอกวันที่เอกสาร" },
        { status: 400 }
      );
    }

    // Check if document number already exists
    const existingRecord = await prisma.printRecord.findFirst({
      where: { documentNumber: finalDocumentNumber },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: "เลขที่เอกสารนี้ถูกใช้แล้ว" },
        { status: 400 }
      );
    }

    // Create print record
    const printRecord = await prisma.printRecord.create({
      data: {
        documentNumber: finalDocumentNumber,
        documentDate: new Date(documentDate),
        printedAt: new Date(),
        applications: {
          connect: applicationIds.map((id: string) => ({ id })),
        },
      },
      include: {
        applications: {
          include: {
            student: true,
            internship: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      printRecord,
      message: `พิมพ์เอกสาร ${applicationIds.length} ฉบับสำเร็จ`,
    });
  } catch (error) {
    console.error("Error printing documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
