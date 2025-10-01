import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { applications as mockApplications, users as mockUsers, internships as mockInternships } from '@/lib/data';

const createApplicationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  internshipId: z.string().min(1, 'Internship ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'priority';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // สร้างข้อมูลจาก mock data
    const tableData = mockApplications.map(app => {
      const student = mockUsers.find(u => u.id === app.studentId);
      const internship = mockInternships.find(i => i.id === app.internshipId);
      return {
        id: app.id,
        studentId: app.studentId,
        studentName: student?.name || 'N/A',
        major: 'เทคโนโลยีสารสนเทศ', // Mock data
        companyName: internship?.company || 'N/A',
        status: app.status,
        dateApplied: app.dateApplied,
        feedback: app.feedback,
        projectTopic: app.projectTopic,
      };
    });

    // กรองข้อมูลตามการค้นหา
    let filteredData = tableData.filter(item => {
      const matchesSearch = !search || 
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.studentId.toLowerCase().includes(search.toLowerCase()) ||
        item.companyName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status === 'all' || item.status === status;
      
      return matchesSearch && matchesStatus;
    });

    // เรียงลำดับข้อมูล
    const statusPriority = { 'pending': 1, 'approved': 2, 'rejected': 3 };
    
    switch (sort) {
      case 'priority':
        filteredData.sort((a, b) => {
          const statusA = statusPriority[a.status as keyof typeof statusPriority] || 4;
          const statusB = statusPriority[b.status as keyof typeof statusPriority] || 4;
          if (statusA !== statusB) return statusA - statusB;
          return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        });
        break;
      case 'date_desc':
        filteredData.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
        break;
      case 'date_asc':
        filteredData.sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
        break;
    }

    // คำนวณ pagination
    const totalCount = filteredData.length;
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return NextResponse.json({
      applications: paginatedData,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ 
      message: 'Failed to fetch applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { studentId, internshipId } = result.data;

    // ตรวจสอบว่า student มีอยู่จริง
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลนักศึกษา' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า internship มีอยู่จริง
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId }
    });

    if (!internship) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลตำแหน่งฝึกงาน' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเคยสมัครแล้วหรือไม่
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: studentId,
        internshipId: internshipId
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'คุณได้สมัครตำแหน่งนี้แล้ว' },
        { status: 409 }
      );
    }

    // สร้างใบสมัครใหม่
    const newApplication = await prisma.application.create({
      data: {
        studentId: studentId,
        internshipId: internshipId,
        status: 'pending',
        dateApplied: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'ส่งใบสมัครเรียบร้อยแล้ว',
      application: newApplication
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { message: 'ไม่สามารถส่งใบสมัครได้' },
      { status: 500 }
    );
  }
}
