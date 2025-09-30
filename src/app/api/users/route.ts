'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { users } from '@/lib/data';
import { roles as validRolesData } from '@/lib/permissions';

const validRoles = validRolesData.map(r => r.id);

// Schema for creating a single user from the form
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

// Schema for validating a user from an uploaded Excel file
const excelUserSchema = z.object({
  Login_id: z.string().optional(),
  email: z.string().email({ message: 'อีเมลไม่ถูกต้อง' }).optional(),
  password: z.string().min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }).optional(),
  role_id: z.string().optional().transform((val, ctx) => {
    if (!val) {
        return []; // Return empty array if role_id is not present
    }
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
  t_title: z.string().optional(),
  t_name: z.string().optional(),
  t_middlename: z.string().optional(),
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

    let filteredUsers = users;

    if (search) {
        const lowercasedSearch = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
            user.name?.toLowerCase().includes(lowercasedSearch) ||
            user.email.toLowerCase().includes(lowercasedSearch) ||
            user.id.toLowerCase().includes(lowercasedSearch)
        );
    }

    if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.roles.includes(role as any));
    }

    return NextResponse.json(filteredUsers.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json([]);
  }
}

async function handleSingleUserCreation(body: any) {
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ message: 'Invalid request body', errors: result.error.flatten() }, { status: 400 });
    }

    const { name, email, password, roles } = result.data;

    const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
        return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้ว' }, { status: 409 });
    }
    
    const newUser = {
        id: createId(),
        name,
        email,
        password, // In a real app, this would be hashed
        roles: roles as any[],
        skills: null,
        statement: null
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
}

async function handleUserUpload(data: any[]) {
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
      
      const validation = excelUserSchema.safeParse(row);

      if (!validation.success) {
        const errorMessages = validation.error.issues.map(issue => `แถวที่ ${rowIndex}: ${issue.message}`);
        errors.push(...errorMessages);
        skippedCount++;
        continue;
      }
      
      const { Login_id, email, password, role_id, t_name, t_surname, e_name, e_surname } = validation.data;
      const roles = role_id;
      
       if (!Login_id && !email) {
          errors.push(`แถวที่ ${rowIndex}: ต้องระบุ Login_id หรือ email`);
          skippedCount++;
          continue;
      }

      const existingUserByEmail = email ? users.find(u => u.email === email) : undefined;
      const existingUserById = Login_id ? users.find(u => u.id === Login_id) : undefined;

      const fullName = [e_name, e_surname].filter(Boolean).join(' ');

      if (Login_id && existingUserById) {
        // Update user
        existingUserById.name = fullName || existingUserById.name;
        if(email) existingUserById.email = email;
        if(password) existingUserById.password = password;
        if(roles && roles.length > 0) existingUserById.roles = roles as any[];
        // @ts-ignore
        existingUserById.t_name = t_name;
        // @ts-ignore
        existingUserById.t_surname = t_surname;
        // @ts-ignore
        existingUserById.e_name = e_name;
        // @ts-ignore
        existingUserById.e_surname = e_surname;
        updatedCount++;
      } else if (existingUserByEmail) {
         errors.push(`แถวที่ ${rowIndex}: อีเมล '${email}' มีอยู่แล้วในระบบ`);
         skippedCount++;
         continue;
      } else {
        // Create new user
        if (!email || !password) {
            errors.push(`แถวที่ ${rowIndex}: ผู้ใช้ใหม่ต้องมี email และ password`);
            skippedCount++;
            continue;
        }

        users.push({
            id: Login_id || createId(),
            name: fullName,
            email,
            password,
            roles: roles as any,
            skills: null,
            statement: null,
            // @ts-ignore
            t_name: t_name,
            t_surname: t_surname,
            e_name: e_name,
            e_surname: e_surname,
        });

        createdCount++;
        if(email) existingEmails.add(email);
        if (Login_id) existingIds.add(Login_id);
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
            return handleUserUpload(body.data);
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
    
    const initialLength = users.length;
    const idsToDelete = new Set(ids);
    
    // This is a hack for the mock data. In a real DB, you'd just delete.
    const originalUsers = [...users];
    users.length = 0; 
    originalUsers.forEach(user => {
        if(!idsToDelete.has(user.id)) {
            users.push(user);
        }
    });

    const deletedCount = initialLength - users.length;

    return NextResponse.json({ message: `${deletedCount} user(s) deleted successfully.` });
  } catch (error) {
    console.error('Failed to delete users:', error);
    return NextResponse.json({ message: 'Failed to delete users' }, { status: 500 });
  }
}
