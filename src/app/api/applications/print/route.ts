import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get applications waiting for documents to be prepared
    const applications = await prisma.application.findMany({
      where: {
        status: { in: ["committee_approved", "awaiting_external_response", "documents_prepared"] },
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        dateApplied: true,
      },
      orderBy: {
        dateApplied: "desc",
      },
    });

    const formattedApplications = applications.map((app) => ({
      id: app.id,
      studentId: app.studentId,
      studentName: "-",
      major: "-",
      companyName: "-",
      status: app.status,
      dateApplied: app.dateApplied.toISOString(),
      isPrinted: false,
      printRecord: undefined,
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

    // Mark selected applications as documents_prepared without printing or numbering
    const updated = await prisma.application.updateMany({
      where: { id: { in: applicationIds as string[] } },
      data: {
        status: "documents_prepared",
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
