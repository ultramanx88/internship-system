import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { createApplication } from '@/lib/application-workflow';
import { z } from 'zod';

const createApplicationSchema = z.object({
  studentId: z.string().min(1, 'ต้องระบุรหัสนักศึกษา'),
  projectTopic: z.string().optional(),
  feedback: z.string().optional(),
  // embedded company fields (subset)
  companyName: z.string().min(1, 'ต้องระบุชื่อสถานประกอบการ'),
  position: z.string().optional()
});

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

    const { studentId, projectTopic, feedback, companyName, position } = result.data;

    // ตรวจสอบว่า student มีสิทธิ์สร้าง application นี้
    if (authResult.user.roles.includes('student') && authResult.user.id !== studentId) {
      return NextResponse.json(
        { success: false, error: 'คุณไม่มีสิทธิ์สร้างคำขอสำหรับนักศึกษาคนอื่น' },
        { status: 403 }
      );
    }

    const result_data = await createApplication({
      studentId,
      projectTopic,
      feedback,
      companyName,
      position
    });

    if (result_data.success) {
      return NextResponse.json(result_data);
    } else {
      return NextResponse.json(result_data, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating application:', error);
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
