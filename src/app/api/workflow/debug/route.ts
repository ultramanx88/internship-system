import { NextRequest, NextResponse } from 'next/server';
import { WorkflowValidator, WorkflowManager } from '@/lib/student-application-workflow';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // ดึง user ID จาก header หรือ query parameter
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // โหลดข้อมูล profile จากฐานข้อมูลโดยตรง
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        faculty: true,
        major: true,
        department: true,
        curriculum: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // สร้าง profile object
    const profile = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      t_name: user.t_name || '',
      t_surname: user.t_surname || '',
      t_title: user.t_title || '',
      facultyId: user.facultyId || '',
      majorId: user.majorId || '',
      departmentId: user.departmentId || '',
      curriculumId: user.curriculumId || '',
      profileComplete: !!(user.name && user.email && user.phone && user.t_name && user.t_surname && user.facultyId && user.majorId)
    };

    // โหลด application ล่าสุด
    const application = await prisma.application.findFirst({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // ตรวจสอบ profile validation
    const profileValidation = WorkflowValidator.validateProfile(profile);

    // ดึง steps พร้อมสถานะ
    const steps = WorkflowManager.getAllStepsWithStatus(profile, application || undefined);

    return NextResponse.json({
      profile,
      application,
      profileValidation,
      steps,
      workflowState: WorkflowManager.getWorkflowState(profile, application || undefined)
    });

  } catch (error) {
    console.error('Debug workflow error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
