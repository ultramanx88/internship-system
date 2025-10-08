import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';
import { unlink } from 'fs/promises';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { roles as validRolesData } from '@/lib/permissions';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const validRoles = validRolesData.map(r => r.id);

const updateUserSchema = z.object({
  newId: z.string().min(1, 'Login ID is required').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roles: z.array(z.string()).optional(),
  
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

  // Academic information
  facultyId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  curriculumId: z.string().nullable().optional(),
  majorId: z.string().nullable().optional(),
  studentYear: z.number().int().min(1).max(4).nullable().optional(),
});

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass auth for testing admin/staff UI

    const { id } = params;
    const normalizedId = decodeURIComponent(id).trim();
    console.info('GET /api/users/[id] - fetching user', { id, normalizedId });
    const user = await prisma.user.findUnique({
      where: { id: normalizedId },
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
        facultyId: true,
        departmentId: true,
        curriculumId: true,
        majorId: true,
        studentYear: true,
        // educatorRole fields removed for compatibility with current schema
      }
    });

    if (!user) {
      console.warn('GET /api/users/[id] - user not found', { id, normalizedId });
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // แปลง roles จาก JSON string เป็น array อย่างปลอดภัย
    let parsedRoles: any = [];
    try {
      const rawRoles: any = (user as any).roles;
      if (Array.isArray(rawRoles)) {
        parsedRoles = rawRoles;
      } else if (typeof rawRoles === 'string' && rawRoles.trim() !== '') {
        // Try JSON parse; if it fails and string is a single role, wrap it
        try {
          parsedRoles = JSON.parse(rawRoles);
          if (!Array.isArray(parsedRoles)) parsedRoles = [String(parsedRoles)];
        } catch {
          parsedRoles = [rawRoles];
        }
      } else {
        parsedRoles = [];
      }
    } catch {
      parsedRoles = [];
    }
    const userWithParsedRoles = {
      ...user,
      roles: parsedRoles
    };

    return NextResponse.json(userWithParsedRoles);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  } finally {
    await cleanup();
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass auth for testing admin/staff UI

    const { id } = params;
    const normalizedId = decodeURIComponent(id).trim();
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

    const { 
      newId, email, password, roles, 
      t_title, t_name, t_middle_name, t_surname, 
      e_title, e_name, e_middle_name, e_surname,
      facultyId, departmentId, curriculumId, majorId, studentYear
    } = result.data;

    // Normalize optional fields
    const sanitizedEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : undefined;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    console.info('PUT /api/users/[id] - checking existing user', { id, normalizedId });
    const existingUser = await prisma.user.findUnique({
      where: { id: normalizedId }
    });

    if (!existingUser) {
      console.warn('PUT /api/users/[id] - user not found for update', { id, normalizedId });
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน', id: normalizedId }, { status: 404 });
    }

    // ตรวจสอบว่า Login ID ใหม่ซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้ามีการเปลี่ยน ID)
    if (newId && newId !== id) {
      const idExists = await prisma.user.findUnique({
        where: { id: newId }
      });

      if (idExists) {
        return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้ Login ID นี้อยู่แล้ว' }, { status: 409 });
      }
    }

    // ตรวจสอบว่าอีเมลซ้ำกับผู้ใช้อื่นหรือไม่ (ถ้ามีการเปลี่ยนอีเมล)
    if (sanitizedEmail && sanitizedEmail !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      });

      if (emailExists) {
        return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้ว' }, { status: 409 });
      }
    }

    let updatedUser;

    // ถ้ามีการเปลี่ยน Login ID ต้องสร้างผู้ใช้ใหม่และลบผู้ใช้เก่า
    if (newId && newId !== id) {
      // สร้างชื่อเต็มจากข้อมูลใหม่หรือเก่า (ไม่รวม title เพื่อให้ชื่อสั้นลง)
      const t_fullName = [
        t_name !== undefined ? t_name : (existingUser as any).t_name,
        t_middle_name !== undefined ? t_middle_name : (existingUser as any).t_middle_name,
        t_surname !== undefined ? t_surname : (existingUser as any).t_surname
      ].filter(Boolean).join(' ');
      
      const e_fullName = [
        e_name !== undefined ? e_name : (existingUser as any).e_name,
        e_middle_name !== undefined ? e_middle_name : (existingUser as any).e_middle_name,
        e_surname !== undefined ? e_surname : (existingUser as any).e_surname
      ].filter(Boolean).join(' ');
      
      const fullName = t_fullName || e_fullName || newId;

      // เตรียมข้อมูลสำหรับผู้ใช้ใหม่
      const newUserData: any = {
        id: newId,
        name: fullName,
        email: sanitizedEmail !== undefined ? sanitizedEmail : existingUser.email,
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
        facultyId: facultyId !== undefined ? facultyId : (existingUser as any).facultyId,
        departmentId: departmentId !== undefined ? departmentId : (existingUser as any).departmentId,
        curriculumId: curriculumId !== undefined ? curriculumId : (existingUser as any).curriculumId,
        majorId: majorId !== undefined ? majorId : (existingUser as any).majorId,
        studentYear: studentYear !== undefined ? studentYear : (existingUser as any).studentYear,
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
          where: { id: normalizedId }
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
          t_name !== undefined ? t_name : (existingUser as any).t_name,
          t_middle_name !== undefined ? t_middle_name : (existingUser as any).t_middle_name,
          t_surname !== undefined ? t_surname : (existingUser as any).t_surname
        ].filter(Boolean).join(' ');
        
        const e_fullName = [
          e_name !== undefined ? e_name : (existingUser as any).e_name,
          e_middle_name !== undefined ? e_middle_name : (existingUser as any).e_middle_name,
          e_surname !== undefined ? e_surname : (existingUser as any).e_surname
        ].filter(Boolean).join(' ');
        
        updateData.name = t_fullName || e_fullName || existingUser.id;
      }
      
      if (sanitizedEmail !== undefined) updateData.email = sanitizedEmail;
      if (roles !== undefined) updateData.roles = JSON.stringify(roles);
      if (t_title !== undefined) updateData.t_title = t_title;
      if (t_name !== undefined) updateData.t_name = t_name;
      if (t_middle_name !== undefined) updateData.t_middle_name = t_middle_name;
      if (t_surname !== undefined) updateData.t_surname = t_surname;
      if (e_title !== undefined) updateData.e_title = e_title;
      if (e_name !== undefined) updateData.e_name = e_name;
      if (e_middle_name !== undefined) updateData.e_middle_name = e_middle_name;
      if (e_surname !== undefined) updateData.e_surname = e_surname;
      if (facultyId !== undefined) updateData.facultyId = facultyId;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (curriculumId !== undefined) updateData.curriculumId = curriculumId;
      if (majorId !== undefined) updateData.majorId = majorId;
      if (studentYear !== undefined) updateData.studentYear = studentYear;
      
      // เข้ารหัสรหัสผ่านใหม่ (ถ้ามี)
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      updatedUser = await prisma.user.update({
        where: { id: normalizedId },
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

    // แปลง roles จาก JSON string เป็น array อย่างปลอดภัย
    let updatedParsedRoles: any = [];
    try {
      updatedParsedRoles = Array.isArray((updatedUser as any).roles)
        ? (updatedUser as any).roles
        : ((updatedUser as any).roles ? JSON.parse((updatedUser as any).roles as any) : []);
    } catch {
      updatedParsedRoles = [];
    }
    const userWithParsedRoles = {
      ...updatedUser,
      roles: updatedParsedRoles
    };

    return NextResponse.json({
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      user: userWithParsedRoles
    });

  } catch (error: any) {
    console.error('Failed to update user:', error);
    const message = error?.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้';
    // Prisma unique constraint
    if (error?.code === 'P2002') {
      const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(',') : (error?.meta?.target || 'unique field');
      const fieldName = typeof target === 'string' && target.includes('email') ? 'อีเมล' : (target.includes('id') ? 'Login ID' : target);
      return NextResponse.json({ message: `ข้อมูลซ้ำกับผู้ใช้อื่น: ${fieldName} ซ้ำ` }, { status: 409 });
    }
    return NextResponse.json({ message, stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined }, { status: 500 });
  } finally {
    await cleanup();
  }
}

// DELETE single user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass auth for testing admin/staff UI

    const { id } = params;
    const normalizedId = decodeURIComponent(id).trim();
    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id: normalizedId },
      select: { id: true, profileImage: true }
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // ลบโฟลเดอร์รูปโปรไฟล์ของผู้ใช้ทั้งโฟลเดอร์ (ถ้ามี)
    try {
      if (existingUser.profileImage) {
        const userDir = path.dirname(path.join(process.cwd(), 'public', existingUser.profileImage));
        if (existsSync(userDir)) {
          // ลบทุกไฟล์ภายใต้โฟลเดอร์ของ user แล้วลบโฟลเดอร์
          try {
            const { readdir } = await import('fs/promises');
            const entries = await readdir(userDir);
            for (const entry of entries) {
              const p = path.join(userDir, entry);
              try { await unlink(p); } catch {}
            }
            const { rmdir } = await import('fs/promises');
            try { await rmdir(userDir); } catch {}
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Failed to delete user profile image on delete:', existingUser.id, e);
    }

    // ลบผู้ใช้
    await prisma.user.delete({
      where: { id: normalizedId }
    });

    return NextResponse.json({ message: 'ลบผู้ใช้สำเร็จ' });

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'ไม่สามารถลบผู้ใช้ได้' }, { status: 500 });
  } finally {
    await cleanup();
  }
}