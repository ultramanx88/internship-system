import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { demoUsers } from '@/lib/demo-users';

const loginSchema = z.object({
  identifier: z.string().min(1, 'กรุณาระบุ ID หรืออีเมล'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
  role: z.string().min(1, 'กรุณาเลือกบทบาท'),
});

export async function POST(request: Request) {
  try {
    console.log(' Login API called');
    
    const body = await request.json();
    console.log(' Request body:', { identifier: body.identifier, role: body.role, password: '***' });
    
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      console.log('Validation failed:', result.error.flatten());
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, password, role } = result.data;

    // 1) Demo users shortcut: allow login without database (useful when DB is down)
    const demo = demoUsers.find(
      (u) => u.id === identifier || u.email === identifier
    );
    if (demo) {
      const demoPassword = (demo as any).password || '123456';
      if (password === demoPassword) {
        const roles = Array.isArray(demo.roles) ? demo.roles : [demo.roles].filter(Boolean);
        
        // Check if demo user has the requested role
        if (!roles.includes(role)) {
          return NextResponse.json(
            { message: 'คุณไม่มีสิทธิ์เข้าใช้งานในบทบาทนี้' },
            { status: 403 }
          );
        }
        
        const authUser = {
          id: demo.id,
          email: demo.email,
          name: demo.name,
          roles,
        };
        return NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ (demo)', user: authUser });
      }
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // 2) Database verification path
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' },
        { status: 500 }
      );
    }

    // ค้นหาผู้ใช้จาก ID หรืออีเมล (สำหรับทุก role)
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
      console.log('User not found:', identifier);
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้งานนี้ในระบบ' },
        { status: 401 }
      );
    }

    console.log('User found:', user.name, user.email);

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // แปลง roles จาก JSON string เป็น array
    let userRoles;
    try {
      userRoles = JSON.parse(user.roles);
      console.log('User roles:', userRoles);
    } catch (roleError) {
      console.error('Failed to parse roles:', user.roles, roleError);
      return NextResponse.json(
        { message: 'ข้อมูลบทบาทผู้ใช้ไม่ถูกต้อง' },
        { status: 500 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีบทบาทที่เลือก
    console.log('Checking role access:', role, 'in', userRoles);
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

    console.log('Login successful for:', user.name);
    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: authUser
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}