'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { users } from '@/lib/data';
import { Role } from '@prisma/client';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
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
        filteredUsers = filteredUsers.filter(user => user.roles.includes(role as Role));
    }

    return NextResponse.json(filteredUsers.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
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
            roles: roles as Role[],
            skills: null,
            statement: null
        };

        users.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ message: 'ไม่สามารถสร้างผู้ใช้ได้' }, { status: 500 });
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
