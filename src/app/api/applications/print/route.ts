import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { applicationIds } = body;

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

    // Mark selected applications as completed (documents ready) without printing or numbering
    const updated = await prisma.application.updateMany({
      where: { id: { in: applicationIds as string[] } },
      data: {
        status: "documents_ready",
        documentsPrepared: true,
        documentsPreparedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: updated.count,
      message: `ทำเครื่องหมายเสร็จสิ้น ${updated.count} รายการ`,
    });
  } catch (error) {
    console.error("Error printing documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
