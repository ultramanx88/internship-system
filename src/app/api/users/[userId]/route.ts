import { NextResponse } from 'next/server';
import { z } from 'zod';
import { users } from '@/lib/data';
import { Role } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: result.error.flatten() }, { status: 400 });
    }
    
    const { name, roles } = result.data;

    // Update user in the mock data array
    users[userIndex] = {
        ...users[userIndex],
        name: name,
        roles: roles as Role[],
    };

    const { password, ...updatedUser } = users[userIndex];

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update user ${params.userId}:`, error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
