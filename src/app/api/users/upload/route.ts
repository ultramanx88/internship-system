'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roles as validRolesData } from '@/lib/permissions';
import { createId } from '@paralleldrive/cuid2';
import { users } from '@/lib/data'; // Import mock data

const validRoles = validRolesData.map(r => r.id);

const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: 'อีเมลไม่ถูกต้อง' }),
  name: z.string().min(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }),
  password: z.string().min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
  roles: z.string().transform((val, ctx) => {
    const roles = val.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ต้องระบุตำแหน่งอย่างน้อย 1 ตำแหน่ง',
      });
      return z.NEVER;
    }
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `พบตำแหน่งที่ไม่ถูกต้อง: ${invalidRoles.join(', ')}`,
        });
        return z.NEVER;
    }
    return roles;
  }),
});

const uploadSchema = z.array(z.any());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = uploadSchema.parse(body);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const existingEmails = new Set(users.map(u => u.email));
    const existingIds = new Set(users.map(u => u.id));

    for (const [index, row] of data.entries()) {
      const rowIndex = index + 2;

      if (row.password !== undefined && typeof row.password !== 'string') {
        row.password = String(row.password);
      }

      const validation = userSchema.safeParse(row);

      if (!validation.success) {
        const errorMessages = validation.error.issues.map(issue => `แถวที่ ${rowIndex}: ${issue.message}`);
        errors.push(...errorMessages);
        skippedCount++;
        continue;
      }
      
      const { id, email, name, password, roles } = validation.data;
      
      if (existingEmails.has(email)) {
        errors.push(`แถวที่ ${rowIndex}: อีเมล '${email}' มีอยู่แล้วในระบบ`);
        skippedCount++;
        continue;
      }

      if (id && existingIds.has(id)) {
        errors.push(`แถวที่ ${rowIndex}: ID '${id}' มีอยู่แล้วในระบบ`);
        skippedCount++;
        continue;
      }
      
      users.push({
          id: id || createId(),
          name,
          email,
          password,
          roles: roles as any,
          skills: null,
          statement: null,
      });

      createdCount++;
      existingEmails.add(email);
      if (id) existingIds.add(id);
    }

    return NextResponse.json({
      message: 'ประมวลผลไฟล์สำเร็จ',
      createdCount,
      updatedCount,
      skippedCount,
      errors,
    });

  } catch (error: any) {
    console.error('Failed to process upload:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล', error: error.message }, { status: 500 });
  }
}
