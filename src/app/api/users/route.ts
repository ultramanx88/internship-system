import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { type Role } from '@/lib/types';
import { createId } from '@paralleldrive/cuid2';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.nativeEnum(Role)).min(1, 'At least one role is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      whereClause.roles = {
        has: role as Role,
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json([]);
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

    // Prevent deletion of critical demo users if needed, though not strictly required by user
    // const protectedIds = ['admin2', 'test001'];
    // const finalIds = ids.filter(id => !protectedIds.includes(id));

    if (ids.length === 0) {
        return NextResponse.json({ message: 'No users to delete or selected users are protected.' });
    }

    await prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ message: `${ids.length} user(s) deleted successfully.` });
  } catch (error) {
    console.error('Failed to delete users:', error);
    return NextResponse.json({ message: 'Failed to delete users' }, { status: 500 });
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

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'มีผู้ใช้ที่ใช้อีเมลนี้อยู่แล้ว' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: {
                id: createId(), // Generate a new CUID
                name,
                email,
                password: hashedPassword,
                roles, // This is now a validated enum array
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ message: 'ไม่สามารถสร้างผู้ใช้ได้' }, { status: 500 });
    }
}
