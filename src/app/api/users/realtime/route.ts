import { NextRequest, NextResponse } from 'next/server';
import { RealtimeCRUD } from '@/lib/realtime-crud';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.string(),
  t_name: z.string().optional(),
  t_surname: z.string().optional(),
  e_name: z.string().optional(),
  e_surname: z.string().optional(),
  phone: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  curriculumId: z.string().optional(),
  majorId: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  t_name: z.string().optional(),
  t_surname: z.string().optional(),
  e_name: z.string().optional(),
  e_surname: z.string().optional(),
  phone: z.string().optional(),
  gpa: z.string().optional(),
  skills: z.string().optional(),
  statement: z.string().optional(),
});

// POST - Create User with Realtime
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    const user = await RealtimeCRUD.createUser(validatedData);
    
    return NextResponse.json({
      success: true,
      message: 'สร้างผู้ใช้สำเร็จ',
      data: user,
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update User with Realtime
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ผู้ใช้' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    
    const user = await RealtimeCRUD.updateUser(userId, validatedData);
    
    return NextResponse.json({
      success: true,
      message: 'อัปเดตผู้ใช้สำเร็จ',
      data: user,
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete User with Realtime
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ผู้ใช้' },
        { status: 400 }
      );
    }
    
    const user = await RealtimeCRUD.deleteUser(userId);
    
    return NextResponse.json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
      data: { id: userId, name: user.name },
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}