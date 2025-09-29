'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import { z } from 'zod';
import { type Role } from '@/lib/types';
import { roles as validRoles } from '@/lib/permissions';

const validRoleIds = validRoles.map(r => r.id);

const userSchema = z.object({
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
    const invalidRoles = roles.filter(r => !validRoleIds.includes(r as Role));
    if (invalidRoles.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `พบตำแหน่งที่ไม่ถูกต้อง: ${invalidRoles.join(', ')}`,
        });
        return z.NEVER;
    }
    return roles as Role[];
  }),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'ไม่พบไฟล์' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const existingUsers = await prisma.user.findMany({
      select: { email: true },
    });
    const existingEmails = new Set(existingUsers.map(u => u.email));

    for (const [index, row] of data.entries()) {
      const rowIndex = index + 2; // Excel rows are 1-based, plus header
      const validation = userSchema.safeParse(row);

      if (!validation.success) {
        const errorMessages = validation.error.issues.map(issue => `แถวที่ ${rowIndex}: ${issue.message} (ข้อมูล: ${JSON.stringify(row)})`);
        errors.push(...errorMessages);
        continue;
      }
      
      const { email, name, password, roles } = validation.data;
      
      if (existingEmails.has(email)) {
        skippedCount++;
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roles,
        },
      });

      createdCount++;
      existingEmails.add(email); // Add to set to handle duplicates within the same file
    }

    return NextResponse.json({
      message: 'ประมวลผลไฟล์สำเร็จ',
      createdCount,
      updatedCount, // Currently not implementing updates, so it's 0
      skippedCount,
      errors,
    });

  } catch (error: any) {
    console.error('Failed to process upload:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์', error: error.message }, { status: 500 });
  }
}
