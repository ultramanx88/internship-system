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
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role_id: z.string().optional(),
  t_title: z.string().optional(),
  t_name: z.string().optional(),
  t_middlename: z.string().optional(),
  t_surname: z.string().optional(),
  e_title: z.string().optional(),
  e_name: z.string().optional(),
  e_middle_name: z.string().optional(),
  e_surname: z.string().optional(),
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
    
    const validatedData = result.data;
    const currentUser = users[userIndex];

    // Combine Thai and English names for the main 'name' field
    const t_fullName = [validatedData.t_name, validatedData.t_surname].filter(Boolean).join(' ');
    const e_fullName = [validatedData.e_name, validatedData.e_surname].filter(Boolean).join(' ');
    const mainName = t_fullName || e_fullName || currentUser.name;

    // Update user in the mock data array
    users[userIndex] = {
        ...currentUser,
        name: mainName,
        email: validatedData.email ?? currentUser.email,
        // Only update password if a new one is provided and is not an empty string
        password: (validatedData.password && validatedData.password.length > 0) ? validatedData.password : currentUser.password,
        roles: validatedData.role_id ? [validatedData.role_id as Role] : currentUser.roles,
        t_title: validatedData.t_title ?? currentUser.t_title,
        t_name: validatedData.t_name ?? currentUser.t_name,
        t_middlename: validatedData.t_middlename ?? currentUser.t_middlename,
        t_surname: validatedData.t_surname ?? currentUser.t_surname,
        e_title: validatedData.e_title ?? currentUser.e_title,
        e_name: validatedData.e_name ?? currentUser.e_name,
        e_middle_name: validatedData.e_middle_name ?? currentUser.e_middle_name,
        e_surname: validatedData.e_surname ?? currentUser.e_surname,
    };

    const { password, ...updatedUser } = users[userIndex];

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update user ${params.userId}:`, error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
