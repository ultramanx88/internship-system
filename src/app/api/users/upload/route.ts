'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import { z } from 'zod';
import { roles as validRolesData } from '@/lib/permissions';
import { createId } from '@paralleldrive/cuid2';
import { users } from '@/lib/data'; // Import mock data

// Define valid roles from permissions lib
const validRoles = validRolesData.map(r => r.id);

// Define a schema without Prisma's Role enum
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
    let updatedCount = 0; // Not implementing updates for now
    let skippedCount = 0;
    const errors: string[] = [];

    // Use existing mock data for checks
    const existingEmails = new Set(users.map(u => u.email));
    const existingIds = new Set(users.map(u => u.id));

    for (const [index, row] of data.entries()) {
      const rowIndex = index + 2; // Excel rows are 1-based, plus header
      
      // Ensure password is a string
      if (row.password !== undefined && typeof row.password !== 'string') {
        row.password = String(row.password);
      }

      const validation = userSchema.safeParse(row);

      if (!validation.success) {
        const errorMessages = validation.error.issues.map(issue => `แถวที่ ${rowIndex}: ${issue.message} (ข้อมูล: ${JSON.stringify(row)})`);
        errors.push(...errorMessages);
        skippedCount++;
        continue;
      }
      
      const { id, email, name, password, roles } = validation.data;
      
      if (existingEmails.has(email)) {
        skippedCount++;
        errors.push(`แถวที่ ${rowIndex}: อีเมล '${email}' มีอยู่แล้วในระบบ (ถูกข้าม)`);
        continue;
      }

      if (id && existingIds.has(id)) {
        skippedCount++;
        errors.push(`แถวที่ ${rowIndex}: ID '${id}' มีอยู่แล้วในระบบ (ถูกข้าม)`);
        continue;
      }
      
      // In a real app, you would hash the password. Here we store it as is or hash it.
      // Let's stick to the convention of storing it plain for the mock data for now.
      
      users.push({
          id: id || createId(),
          name,
          email,
          password, // Storing plain text password for mock data consistency
          roles: roles as any, // Cast to any to match mock data type
          skills: null,
          statement: null,
      });

      createdCount++;
      existingEmails.add(email); // Add to set to handle duplicates within the same file
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
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์', error: error.message }, { status: 500 });
  }
}
