import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const verifySchema = z.object({
  identifier: z.string().min(1, 'กรุณาระบุ ID หรืออีเมล'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, password } = result.data;

    // ค้นหาผู้ใช้จาก ID หรืออีเมล
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roles: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้งานนี้ในระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // แปลง roles จาก JSON string เป็น array
    const userRoles = JSON.parse(user.roles);

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวมรหัสผ่าน)
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles
    };

    return NextResponse.json({
      message: 'ตรวจสอบข้อมูลสำเร็จ',
      user: authUser
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' },
      { status: 500 }
    );
  }
}