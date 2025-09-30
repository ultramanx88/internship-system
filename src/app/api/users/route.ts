'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import * as xlsx from 'xlsx';
import { users } from '@/lib/data';
import { roles as validRolesData } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const validRoles = validRolesData.map(r => r.id);

// Schema for creating a single user from the form
const createUserSchema = z.object({
  id: z.string().min(1, 'Login ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  
  // ข้อมูลภาษาไทย
  t_title: z.string().optional(),
  t_name: z.string().optional(),
  t_middle_name: z.string().optional(),
  t_surname: z.string().optional(),
  
  // ข้อมูลภาษาอังกฤษ
  e_title: z.string().optional(),
  e_name: z.string().optional(),
  e_middle_name: z.string().optional(),
  e_surname: z.string().optional(),
});

// Schema for validating a user from an uploaded Excel file
const excelUserSchema = z.object({
  Login_id: z.string().min(1, 'Login_id จำเป็นต้องระบุ'),
  password: z.string().optional(),
  role_id: z.string().optional().transform((val, ctx) => {
    if (!val) {
        return ['student']; // default role
    }
    const roles = val.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
    const invalidRoles = roles.filter(r => !validRoles.includes(r as any));
    if (invalidRoles.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `พบตำแหน่งที่ไม่ถูกต้อง: ${invalidRoles.join(', ')}`,
        });
        return z.NEVER;
    }
    return roles;
  }),
  t_title: z.string().optional(),
  t_name: z.string().optional(),
  t_middle_name: z.string().optional(),
  t_surname: z.string().optional(),
  e_title: z.string().optional(),
  e_name: z.string().optional(),
  e_middle_name: z.string().optional(),
  e_surname: z.string().optional(),
});


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    // ดึงข้อมูลจากฐานข้อมูลจริง
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'all') {
      whereClause.roles = { contains: `"${role}"` };
    }

    const dbUsers = await prisma.user.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        skills: true,
        statement: true
      }
    });

    // แปลง roles จาก JSON string กลับเป็น array
    const usersWithParsedRoles = dbUsers.map(user => ({
      ...user,
      roles: JSON.parse(user.roles)
    }));

    return NextResponse.json(usersWithParsedRoles);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

async function handleSingleUserCreation(body: any) {
    console.log('Creating user with body:', body);
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
        console.log('Validation failed:', result.error);
        return NextResponse.json({ message: 'Invalid request body', errors: result.error.flatten() }, { status: 400 });
    }

    const { id, email, password, roles, t_title, t_name, t_middle_name, t_surname, e_title, e_name, e_middle_name, e_surname } = result.data;

    try {
        // ตรวจสอบว่ามีผู้ใช้ที่ใช้ Login ID นี้อยู่แล้วหรือไม่
        const existingUserById = await prisma.user.findUnique({
            where: { id }
        });

        if (existingUserById) {
            return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้ Login ID นี้อยู่แล้ว' }, { status: 409 });
        }

        // ตรวจสอบว่ามีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้วหรือไม่
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUserByEmail) {
            return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้ว' }, { status: 409 });
        }
        
        // สร้างชื่อเต็มจากข้อมูลที่กรอก
        const t_fullName = [t_title, t_name, t_middle_name, t_surname].filter(Boolean).join(' ');
        const e_fullName = [e_title, e_name, e_middle_name, e_surname].filter(Boolean).join(' ');
        const fullName = t_fullName || e_fullName || id;
        
        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // สร้างผู้ใช้ใหม่ในฐานข้อมูล
        const newUser = await prisma.user.create({
            data: {
                id,
                name: fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                roles: JSON.stringify(roles),
                skills: null,
                statement: null,
                t_title: t_title || null,
                t_name: t_name || null,
                t_middle_name: t_middle_name || null,
                t_surname: t_surname || null,
                e_title: e_title || null,
                e_name: e_name || null,
                e_middle_name: e_middle_name || null,
                e_surname: e_surname || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
                skills: true,
                statement: true
            }
        });

        // แปลง roles จาก JSON string กลับเป็น array
        const userWithParsedRoles = {
          ...newUser,
          roles: JSON.parse(newUser.roles)
        };

        return NextResponse.json(userWithParsedRoles, { status: 201 });
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ message: 'ไม่สามารถสร้างผู้ใช้ได้', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

async function handleUserUpload(sheetData: any[][]) {
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // This handles multi-line headers by assuming the first row is descriptive and the second is the actual header.
    const header = sheetData[1]; 
    const dataRows = sheetData.slice(2); 

    const json = dataRows.map(row => {
        const obj: { [key: string]: any } = {};
        header.forEach((key: string, index: number) => {
            if (key) { // Ensure key is not null or undefined
              obj[key] = row[index];
            }
        });
        return obj;
    });

    for (const [index, row] of json.entries()) {
      const rowIndex = index + 3; // +2 for header rows, +1 for 1-based index

      if (row.password !== undefined && typeof row.password !== 'string') {
        row.password = String(row.password);
      }
      
      const validation = excelUserSchema.safeParse(row);

      if (!validation.success) {
        const errorMessages = validation.error.issues.map(issue => `แถวที่ ${rowIndex}: ${issue.path.join('.')} - ${issue.message}`);
        errors.push(...errorMessages);
        skippedCount++;
        continue;
      }
      
      const { Login_id, password, role_id, t_title, t_name, t_middle_name, t_surname, e_title, e_name, e_middle_name, e_surname } = validation.data;
      const roles = role_id;

      try {
        // ตรวจสอบว่ามีผู้ใช้อยู่แล้วหรือไม่
        const existingUser = await prisma.user.findUnique({
          where: { id: Login_id }
        });
        
        // สร้างชื่อเต็มจากข้อมูลภาษาไทยหรือภาษาอังกฤษ
        const t_fullName = [t_title, t_name, t_middle_name, t_surname].filter(Boolean).join(' ');
        const e_fullName = [e_title, e_name, e_middle_name, e_surname].filter(Boolean).join(' ');
        const fullName = t_fullName || e_fullName || Login_id;

        // สร้างอีเมลสำหรับนักศึกษา (ถ้าไม่มี)
        let userEmail = '';
        if (roles.includes('student')) {
          // นักศึกษาใช้รูปแบบ รหัสนักศึกษา@student.university.ac.th
          userEmail = `${Login_id}@student.university.ac.th`;
        } else {
          // Role อื่นๆ ต้องมีอีเมลจริง หรือใช้รูปแบบ Login_id@university.ac.th
          userEmail = `${Login_id}@university.ac.th`;
        }

        const userData: any = {
          name: fullName,
          email: userEmail,
        };

        if (roles && roles.length > 0) userData.roles = JSON.stringify(roles);

        if (existingUser) {
          // อัปเดตผู้ใช้ที่มีอยู่
          if (password) {
            userData.password = await bcrypt.hash(password, 10);
          }
          
          await prisma.user.update({
            where: { id: Login_id },
            data: userData
          });
          updatedCount++;
        } else {
          // สร้างผู้ใช้ใหม่
          if (!password) {
              errors.push(`แถวที่ ${rowIndex}: ผู้ใช้ใหม่ต้องมี password`);
              skippedCount++;
              continue;
          }
          
          await prisma.user.create({
            data: {
              id: Login_id,
              email: userEmail,
              password: await bcrypt.hash(password, 10),
              roles: JSON.stringify(roles),
              skills: null,
              statement: null,
              name: fullName,
            }
          });

          createdCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${Login_id}:`, error);
        errors.push(`แถวที่ ${rowIndex}: เกิดข้อผิดพลาดในการบันทึกข้อมูล`);
        skippedCount++;
      }
    }
    
    return NextResponse.json({
      message: 'ประมวลผลไฟล์สำเร็จ',
      createdCount,
      updatedCount,
      skippedCount,
      errors,
    });
}


export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check if this is an upload action
        if (body.action === 'upload' && Array.isArray(body.data)) {
             const data = body.data;
             // Read the workbook and sheet
            const workbook = xlsx.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert sheet to array of arrays, which is easier for handling multi-line headers
            const sheetData: any[][] = xlsx.utils.sheet_to_json(worksheet, {
                header: 1, // This is the key change to read all rows as arrays
                raw: false,
                defval: null
            });

            return handleUserUpload(sheetData);
        }
        
        // Otherwise, handle single user creation
        return handleSingleUserCreation(body);

    } catch (error) {
        console.error('Failed to process POST request:', error);
        return NextResponse.json({ message: 'ไม่สามารถประมวลผลคำขอได้' }, { status: 500 });
    }
}


const deleteUsersSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = deleteUsersSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: result.error.errors }, { status: 400 });
    }

    const { ids } = result.data;
    
    // ลบผู้ใช้จากฐานข้อมูล
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ 
      message: `ลบผู้ใช้ ${deleteResult.count} คนสำเร็จ` 
    });
  } catch (error) {
    console.error('Failed to delete users:', error);
    return NextResponse.json({ message: 'ไม่สามารถลบผู้ใช้ได้' }, { status: 500 });
  }
}
