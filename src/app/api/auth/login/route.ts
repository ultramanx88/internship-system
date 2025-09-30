import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  identifier: z.string().min(1, 'กรุณาระบุ ID หรืออีเมล'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
  role: z.string().min(1, 'กรุณาเลือกบทบาท'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, password, role } = result.data;

    let user;

    // ถ้าเป็นนักศึกษา ให้ค้นหาด้วย ID เท่านั้น
    if (role === 'student') {
      user = await prisma.user.findFirst({
        where: { id: identifier },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          roles: true
        }
      });
    } else {
      // Role อื่นๆ สามารถใช้ทั้ง ID และอีเมล
      user = await prisma.user.findFirst({
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
    }

    if (!user) {
      const errorMessage = role === 'student' 
        ? 'ไม่พบรหัสนักศึกษานี้ในระบบ' 
        : 'ไม่พบผู้ใช้งานนี้ในระบบ';
      return NextResponse.json(
        { message: errorMessage },
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

    // ตรวจสอบว่าผู้ใช้มีบทบาทที่เลือก
    if (!userRoles.includes(role)) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์เข้าใช้งานในบทบาทนี้' },
        { status: 403 }
      );
    }

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวมรหัสผ่าน)
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles
    };

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: authUser
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}