import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { roles as validRolesData } from '@/lib/permissions';

const validRoles = validRolesData.map(r => r.id);

const updateUserSchema = z.object({
  newId: z.string().min(1, 'Login ID is required').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required').optional(),
  
  // ข้อมูลภาษาไทย
  t_title: z.string().nullable().optional(),
  t_name: z.string().nullable().optional(),
  t_middle_name: z.string().nullable().optional(),
  t_surname: z.string().nullable().optional(),
  
  // ข้อมูลภาษาอังกฤษ
  e_title: z.string().nullable().optional(),
  e_name: z.string().nullable().optional(),
  e_middle_name: z.string().nullable().optional(),
  e_surname: z.string().nullable().optional(),
});

// GET single user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        skills: true,
        statement: true,
        t_title: true,
        t_name: true,
        t_middle_name: true,
        t_surname: true,
        e_title: true,
        e_name: true,
        e_middle_name: true,
        e_surname: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // แปลง roles จาก JSON string เป็น array
    const userWithParsedRoles = {
      ...user,
      roles: JSON.parse(user.roles)
    };

    return NextResponse.json(userWithParsedRoles);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('PUT request body:', body);
    console.log('Params:', params);
    
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { newId, email, password, roles, t_title, t_name, t_middle_name, t_surname, e_title, e_name, e_middle_name, e_surname } = result.data;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // ตรวจสอบว่า Login ID ใหม่ซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้ามีการเปลี่ยน ID)
    if (newId && newId !== params.id) {
      const idExists = await prisma.user.findUnique({
        where: { id: newId }
      });

      if (idExists) {
        return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้ Login ID นี้อยู่แล้ว' }, { status: 409 });
      }
    }

    // ตรวจสอบว่าอีเมลซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้ามีการเปลี่ยนอีเมล)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExists) {
        return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้ว' }, { status: 409 });
      }
    }

    let updatedUser;

    // ถ้ามีการเปลี่ยน Login ID ต้องสร้างผู้ใช้ใหม่และลบผู้ใช้เก่า
    if (newId && newId !== params.id) {
      // สร้างชื่อเต็มจากข้อมูลใหม่หรือเก่า
      const t_fullName = [
        t_title !== undefined ? t_title : (existingUser as any).t_title,
        t_name !== undefined ? t_name : (existingUser as any).t_name,
        t_middle_name !== undefined ? t_middle_name : (existingUser as any).t_middle_name,
        t_surname !== undefined ? t_surname : (existingUser as any).t_surname
      ].filter(Boolean).join(' ');
      
      const e_fullName = [
        e_title !== undefined ? e_title : (existingUser as any).e_title,
        e_name !== undefined ? e_name : (existingUser as any).e_name,
        e_middle_name !== undefined ? e_middle_name : (existingUser as any).e_middle_name,
        e_surname !== undefined ? e_surname : (existingUser as any).e_surname
      ].filter(Boolean).join(' ');
      
      const fullName = t_fullName || e_fullName || newId;

      // เตรียมข้อมูลสำหรับผู้ใช้ใหม่
      const newUserData: any = {
        id: newId,
        name: fullName,
        email: email !== undefined ? email.toLowerCase() : existingUser.email,
        password: password ? await bcrypt.hash(password, 10) : existingUser.password,
        roles: roles !== undefined ? JSON.stringify(roles) : existingUser.roles,
        skills: existingUser.skills,
        statement: existingUser.statement,
        t_title: t_title !== undefined ? t_title : (existingUser as any).t_title,
        t_name: t_name !== undefined ? t_name : (existingUser as any).t_name,
        t_middle_name: t_middle_name !== undefined ? t_middle_name : (existingUser as any).t_middle_name,
        t_surname: t_surname !== undefined ? t_surname : (existingUser as any).t_surname,
        e_title: e_title !== undefined ? e_title : (existingUser as any).e_title,
        e_name: e_name !== undefined ? e_name : (existingUser as any).e_name,
        e_middle_name: e_middle_name !== undefined ? e_middle_name : (existingUser as any).e_middle_name,
        e_surname: e_surname !== undefined ? e_surname : (existingUser as any).e_surname,
      };

      // ใช้ transaction เพื่อให้แน่ใจว่าการสร้างและลบเกิดขึ้นพร้อมกัน
      updatedUser = await prisma.$transaction(async (tx) => {
        // สร้างผู้ใช้ใหม่
        const newUser = await tx.user.create({
          data: newUserData,
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            skills: true,
            statement: true,
          }
        });

        // ลบผู้ใช้เก่า
        await tx.user.delete({
          where: { id: params.id }
        });

        return newUser;
      });
    } else {
      // อัปเดตข้อมูลปกติ (ไม่เปลี่ยน ID)
      const updateData: any = {};
      
      // สร้างชื่อเต็มใหม่ถ้ามีการเปลี่ยนแปลง
      const shouldUpdateName = t_title !== undefined || t_name !== undefined || t_middle_name !== undefined || t_surname !== undefined ||
                              e_title !== undefined || e_name !== undefined || e_middle_name !== undefined || e_surname !== undefined;
      
      if (shouldUpdateName) {
        const t_fullName = [
          t_title !== undefined ? t_title : (existingUser as any).t_title,
          t_name !== undefined ? t_name : (existingUser as any).t_name,
          t_middle_name !== undefined ? t_middle_name : (existingUser as any).t_middle_name,
          t_surname !== undefined ? t_surname : (existingUser as any).t_surname
        ].filter(Boolean).join(' ');
        
        const e_fullName = [
          e_title !== undefined ? e_title : (existingUser as any).e_title,
          e_name !== undefined ? e_name : (existingUser as any).e_name,
          e_middle_name !== undefined ? e_middle_name : (existingUser as any).e_middle_name,
          e_surname !== undefined ? e_surname : (existingUser as any).e_surname
        ].filter(Boolean).join(' ');
        
        updateData.name = t_fullName || e_fullName || existingUser.id;
      }
      
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (roles !== undefined) updateData.roles = JSON.stringify(roles);
      if (t_title !== undefined) updateData.t_title = t_title;
      if (t_name !== undefined) updateData.t_name = t_name;
      if (t_middle_name !== undefined) updateData.t_middle_name = t_middle_name;
      if (t_surname !== undefined) updateData.t_surname = t_surname;
      if (e_title !== undefined) updateData.e_title = e_title;
      if (e_name !== undefined) updateData.e_name = e_name;
      if (e_middle_name !== undefined) updateData.e_middle_name = e_middle_name;
      if (e_surname !== undefined) updateData.e_surname = e_surname;
      
      // เข้ารหัสรหัสผ่านใหม่ (ถ้ามี)
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          skills: true,
          statement: true,
        }
      });
    }

    // แปลง roles จาก JSON string เป็น array
    const userWithParsedRoles = {
      ...updatedUser,
      roles: JSON.parse(updatedUser.roles)
    };

    return NextResponse.json({
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      user: userWithParsedRoles
    });

  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

// DELETE single user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // ลบผู้ใช้
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'ลบผู้ใช้สำเร็จ' });

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'ไม่สามารถลบผู้ใช้ได้' }, { status: 500 });
  }
}