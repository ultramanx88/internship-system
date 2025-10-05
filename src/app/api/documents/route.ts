import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ดึงข้อมูลใบสมัครที่อนุมัติแล้ว
    const applications = await prisma.application.findMany({
      where: {
        status: 'approved'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications for documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { applicationIds, documentType, action } = await request.json();

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    if (action === 'print') {
      // อัปเดตสถานะเอกสารเป็น "พิมพ์แล้ว"
      const updatedApplications = await prisma.application.updateMany({
        where: {
          id: {
            in: applicationIds
          }
        },
        data: {
          status: 'documents_ready',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: `เอกสาร ${documentType} ถูกพิมพ์แล้วสำหรับ ${updatedApplications.count} ใบสมัคร`,
        count: updatedApplications.count
      });
    }

    if (action === 'deliver') {
      // อัปเดตสถานะเอกสารเป็น "ส่งมอบแล้ว"
      const updatedApplications = await prisma.application.updateMany({
        where: {
          id: {
            in: applicationIds
          }
        },
        data: {
          status: 'documents_delivered',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: `เอกสารถูกส่งมอบแล้วสำหรับ ${updatedApplications.count} ใบสมัคร`,
        count: updatedApplications.count
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
}