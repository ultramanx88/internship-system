import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { 
  checkStudentEligibility, 
  createStudentApplication, 
  getStudentApplications,
  getStudentWorkflowStatus 
} from '@/lib/student-workflow';
import { z } from 'zod';

const createApplicationSchema = z.object({
  internshipId: z.string().min(1, 'ต้องระบุรหัสการฝึกงาน'),
  projectTopic: z.string().optional(),
  feedback: z.string().optional()
});

// GET - ตรวจสอบสิทธิ์และดึงข้อมูล
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['student', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const studentId = authResult.user.roles.includes('student') 
      ? authResult.user.id 
      : searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุรหัสนักศึกษา' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'eligibility':
        // ตรวจสอบสิทธิ์การขอฝึกงาน
        const eligibilityResult = await checkStudentEligibility(studentId);
        return NextResponse.json(eligibilityResult);

      case 'applications':
        // ดึงรายการคำขอฝึกงาน
        const applicationsResult = await getStudentApplications(studentId);
        return NextResponse.json(applicationsResult);

      case 'status':
        // ตรวจสอบสถานะ workflow
        const applicationId = searchParams.get('applicationId');
        if (!applicationId) {
          return NextResponse.json(
            { success: false, error: 'ต้องระบุรหัสคำขอฝึกงาน' },
            { status: 400 }
          );
        }
        const statusResult = await getStudentWorkflowStatus(applicationId);
        return NextResponse.json({
          success: true,
          workflowStatus: statusResult
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Action ไม่ถูกต้อง' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in student workflow GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดำเนินการได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

// POST - สร้างคำขอฝึกงาน
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['student', 'admin', 'staff']);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const result = createApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: result.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { internshipId, projectTopic, feedback } = result.data;
    const studentId = authResult.user.id;

    const result_data = await createStudentApplication({
      studentId,
      internshipId,
      projectTopic,
      feedback
    });

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating student application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถสร้างคำขอฝึกงานได้',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
