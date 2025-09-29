'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { applications, users } from './data';
import { reviewApplication } from '@/ai/flows/teacher-application-review';
import type { ReviewApplicationInput } from '@/ai/flows/teacher-application-review';
import { ApplicationStatus } from './types';

const RegisterSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  studentSkills: z.string(),
  studentStatement: z.string(),
});

export async function registerStudent(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, message: 'ข้อมูลแบบฟอร์มไม่ถูกต้อง' };
  }
  
  const { name, email, password, studentSkills, studentStatement } = validatedFields.data;

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return { success: false, message: 'มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว' };
  }

  const newUser = {
    id: `user-${users.length + 1}`,
    name,
    email,
    password, // In a real app, hash this!
    role: 'student' as const,
    skills: studentSkills,
    statement: studentStatement,
  };

  users.push(newUser);
  console.log('New user registered:', newUser);

  return { success: true, message: 'ลงทะเบียนสำเร็จ!' };
}

export async function getAiRecommendation(input: ReviewApplicationInput) {
    try {
        const result = await reviewApplication(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('AI recommendation failed:', error);
        return { success: false, message: 'ไม่สามารถรับคำแนะนำจาก AI ได้' };
    }
}


export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus, feedback?: string) {
    const applicationIndex = applications.findIndex(app => app.id === applicationId);

    if (applicationIndex === -1) {
        return { success: false, message: 'ไม่พบใบสมัคร' };
    }

    applications[applicationIndex].status = status;
    if (feedback) {
        applications[applicationIndex].feedback = feedback;
    }
    
    // In a real app, you would revalidate specific paths, e.g., revalidatePath('/teacher')
    // For this demo, we can revalidate the entire app to reflect changes everywhere.
    revalidatePath('/', 'layout');

    return { success: true, message: `ใบสมัคร ${status}` };
}
