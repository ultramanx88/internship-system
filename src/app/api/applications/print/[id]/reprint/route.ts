import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = id;

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
        printRecord: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "ไม่พบเอกสารที่ต้องการ" },
        { status: 404 }
      );
    }

    if (!application.printRecord) {
      return NextResponse.json(
        { error: "เอกสารนี้ยังไม่เคยถูกพิมพ์" },
        { status: 400 }
      );
    }

    const printRecord = application.printRecord;

    if (!printRecord) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการพิมพ์" },
        { status: 400 }
      );
    }

    // Log reprint activity (optional)
    console.log(
      `Reprinting document ${printRecord.documentNumber} for application ${applicationId}`
    );

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        studentName: application.student.name,
        companyName: application.internship.company.name,
        documentNumber: printRecord.documentNumber,
        documentDate: printRecord.documentDate,
      },
      message: "พิมพ์ซ้ำเอกสารสำเร็จ",
    });
  } catch (error) {
    console.error("Error reprinting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
