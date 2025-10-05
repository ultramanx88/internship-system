import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const internshipId = searchParams.get('internshipId');
    
    console.log('Applications API - Fetching applications, studentId:', studentId, 'internshipId:', internshipId);
    
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (internshipId) whereClause.internshipId = internshipId;
    
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true
          }
        },
        internship: {
          include: {
            company: true
          }
        }
      },
      orderBy: {
        dateApplied: 'desc'
      }
    });
    
    console.log('Applications API - Found applications:', applications.length);
    
    return NextResponse.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Applications API - Error fetching applications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      internshipId, 
      studentReason, 
      expectedSkills, 
      preferredStartDate, 
      availableDuration,
      projectProposal,
      status = 'pending' // เพิ่ม status parameter
    } = body;
    
    console.log('Applications API - Creating application:', { studentId, internshipId, status });
    
    // Validation
    if (!studentId || !internshipId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าไม่ได้สมัครซ้ำ
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId,
        internshipId
      }
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Already applied to this internship' },
        { status: 409 }
      );
    }

    // หาอาจารย์ประจำวิชาที่เหมาะสม (ในระบบจริงจะใช้ logic ที่ซับซ้อนกว่า)
    const courseInstructor = await prisma.user.findFirst({
      where: {
        roles: {
          contains: 'courseInstructor'
        }
      }
    });

    const application = await prisma.application.create({
      data: {
        studentId,
        internshipId,
        courseInstructorId: courseInstructor?.id, // กำหนดอาจารย์ประจำวิชา
        status: status as any,
        dateApplied: new Date(),
        feedback: null,
        projectTopic: projectProposal || null
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            t_name: true,
            t_surname: true,
            e_name: true,
            e_surname: true
          }
        },
        internship: {
          include: {
            company: true
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Applications API - Created application:', application.id, 'assigned to instructor:', courseInstructor?.name);
    
    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Applications API - Error creating application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}