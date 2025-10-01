import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const uploadDocumentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(['cv', 'transcript', 'certificate', 'other']),
  size: z.number().positive('File size must be positive'),
  url: z.string().url('Valid URL is required'),
});

// GET - Fetch user documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // TODO: ในระบบจริงจะดึงข้อมูลจากฐานข้อมูล
    // const documents = await prisma.document.findMany({
    //   where: { studentId },
    //   orderBy: { uploadDate: 'desc' }
    // });

    // Mock data for now
    const mockDocuments = [
      {
        id: '1',
        name: 'CV_Student.pdf',
        type: 'cv',
        status: 'approved',
        uploadDate: new Date('2024-01-15'),
        size: 245760,
        url: '/documents/cv_student.pdf'
      }
    ];

    return NextResponse.json({
      documents: mockDocuments
    });

  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const studentId = formData.get('studentId') as string;

    if (!file || !type || !studentId) {
      return NextResponse.json(
        { message: 'File, type, and studentId are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only PDF, Word, and images are allowed.' },
        { status: 400 }
      );
    }

    // TODO: ในระบบจริงจะอัพโหลดไฟล์ไปยัง storage (AWS S3, Google Cloud Storage, etc.)
    // const fileUrl = await uploadFileToStorage(file);
    
    // TODO: บันทึกข้อมูลลงฐานข้อมูล
    // const document = await prisma.document.create({
    //   data: {
    //     studentId,
    //     name: file.name,
    //     type,
    //     size: file.size,
    //     url: fileUrl,
    //     status: 'pending'
    //   }
    // });

    // Mock response for now
    const mockDocument = {
      id: Date.now().toString(),
      name: file.name,
      type,
      status: 'pending',
      uploadDate: new Date(),
      size: file.size,
      url: `/documents/${file.name}`
    };

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: mockDocument
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json(
      { message: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }

    // TODO: ในระบบจริงจะลบไฟล์จาก storage และฐานข้อมูล
    // await deleteFileFromStorage(document.url);
    // await prisma.document.delete({
    //   where: { id: documentId }
    // });

    return NextResponse.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json(
      { message: 'Failed to delete document' },
      { status: 500 }
    );
  }
}