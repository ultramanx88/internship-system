import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { z } from 'zod';
import { sanitizeString } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff', 'courseInstructor', 'committee', 'student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;
    
    console.log('Settings API - User ID:', user.id);
    
    console.log('Settings API - Querying database for user:', user.id);
    
    // ค้นหาผู้ใช้พร้อม relations
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    console.log('Settings API - Database query result:', dbUser ? 'User found' : 'User not found');
    
    if (!dbUser) {
      console.log('Settings API - User not found in database:', user.id);
      return NextResponse.json(
        { success: false, error: 'User not found', details: `No user found with ID: ${user.id}` },
        { status: 404 }
      );
    }
    
    // แปลงข้อมูลให้ตรงกับ format ที่ frontend ต้องการ
    const settings = {
      // ข้อมูลภาษาไทย
      thaiTitle: dbUser.t_title || '',
      thaiName: dbUser.t_name || '',
      thaiMiddleName: dbUser.t_middle_name || '',
      thaiSurname: dbUser.t_surname || '',
      // ข้อมูลภาษาอังกฤษ
      englishTitle: dbUser.e_title || '',
      englishName: dbUser.e_name || '',
      englishMiddleName: dbUser.e_middle_name || '',
      englishSurname: dbUser.e_surname || '',
      // ข้อมูลอื่นๆ
      email: dbUser.email,
      phone: dbUser.phone || '',
      studentId: dbUser.id,
      faculty: dbUser.faculty?.nameTh || '',
      department: dbUser.department?.nameTh || '',
      program: dbUser.curriculum?.nameTh || '',
      major: dbUser.major?.nameTh || '',
      campus: dbUser.campus || '',
      gpa: dbUser.gpa || '',
      nationality: dbUser.nationality || 'ไทย',
      passportId: dbUser.passportId || '',
      visaType: dbUser.visaType || 'none',
      skills: dbUser.skills || '',
      statement: dbUser.statement || '',
      // การตั้งค่าการแจ้งเตือน
      notifications: {
        email: dbUser.notifyEmail ?? true,
        push: dbUser.notifyPush ?? false,
        sms: dbUser.notifySms ?? false,
        applicationUpdates: dbUser.notifyAppUpdates ?? true,
        deadlineReminders: dbUser.notifyDeadlines ?? true,
        systemNews: dbUser.notifyNews ?? false
      },
      // การตั้งค่าทั่วไป
      preferences: {
        language: dbUser.language || 'th',
        theme: dbUser.theme || 'light',
        dateFormat: dbUser.dateFormat || 'thai'
      }
    };
    
    // ตรวจสอบและแสดงข้อมูลในคอนโซล
    console.log('API Settings - Full user data:', dbUser);
    console.log('API Settings - Full settings data:', settings);
    console.log('Settings API - Returning settings for user:', dbUser.id);
    console.log('Settings API - Thai Name:', settings.thaiName, settings.thaiSurname);
    console.log('Settings API - English Name:', settings.englishName, settings.englishSurname);
    console.log('Settings API - Full user data:', JSON.stringify(user, null, 2));
    console.log('Settings API - Full settings data:', JSON.stringify(settings, null, 2));
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Settings API - Error getting settings:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

const SettingsSchema = z.object({
  thaiTitle: z.string().optional(),
  thaiName: z.string().optional(),
  thaiMiddleName: z.string().optional(),
  thaiSurname: z.string().optional(),
  englishTitle: z.string().optional(),
  englishName: z.string().optional(),
  englishMiddleName: z.string().optional(),
  englishSurname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  campus: z.string().optional(),
  gpa: z.string().optional(),
  nationality: z.string().optional(),
  passportId: z.string().optional(),
  visaType: z.string().optional(),
  skills: z.string().optional(),
  statement: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    applicationUpdates: z.boolean().optional(),
    deadlineReminders: z.boolean().optional(),
    systemNews: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    theme: z.string().optional(),
    dateFormat: z.string().optional(),
  }).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff', 'courseInstructor', 'committee', 'student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;
    const raw = await request.json();
    const parsed = SettingsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;
    
    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        // ข้อมูลส่วนตัว
        t_title: body.thaiTitle ? sanitizeString(body.thaiTitle) : undefined,
        t_name: body.thaiName ? sanitizeString(body.thaiName) : undefined,
        t_middle_name: body.thaiMiddleName ? sanitizeString(body.thaiMiddleName) : undefined,
        t_surname: body.thaiSurname ? sanitizeString(body.thaiSurname) : undefined,
        e_title: body.englishTitle ? sanitizeString(body.englishTitle) : undefined,
        e_name: body.englishName ? sanitizeString(body.englishName) : undefined,
        e_middle_name: body.englishMiddleName ? sanitizeString(body.englishMiddleName) : undefined,
        e_surname: body.englishSurname ? sanitizeString(body.englishSurname) : undefined,
        email: body.email ? body.email.toLowerCase() : undefined,
        phone: body.phone ? sanitizeString(body.phone) : undefined,
        campus: body.campus ? sanitizeString(body.campus) : undefined,
        gpa: body.gpa ? sanitizeString(body.gpa) : undefined,
        nationality: body.nationality ? sanitizeString(body.nationality) : undefined,
        passportId: body.passportId ? sanitizeString(body.passportId) : undefined,
        visaType: body.visaType ? sanitizeString(body.visaType) : undefined,
        skills: body.skills ? sanitizeString(body.skills) : undefined,
        statement: body.statement ? sanitizeString(body.statement) : undefined,
        // การตั้งค่าการแจ้งเตือน
        notifyEmail: body.notifications?.email ?? true,
        notifyPush: body.notifications?.push ?? false,
        notifySms: body.notifications?.sms ?? false,
        notifyAppUpdates: body.notifications?.applicationUpdates ?? true,
        notifyDeadlines: body.notifications?.deadlineReminders ?? true,
        notifyNews: body.notifications?.systemNews ?? false,
        // การตั้งค่าทั่วไป
        language: body.preferences?.language ?? 'th',
        theme: body.preferences?.theme ?? 'light',
        dateFormat: body.preferences?.dateFormat ?? 'thai',
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}

// เพิ่ม DELETE method สำหรับลบการตั้งค่า (reset to default)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff', 'courseInstructor', 'committee', 'student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;

    // Reset settings to default values
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: null,
        campus: null,
        gpa: null,
        nationality: 'ไทย',
        passportId: null,
        visaType: 'none',
        profileImage: null,
        // Reset notification settings
        notifyEmail: true,
        notifyPush: false,
        notifySms: false,
        notifyAppUpdates: true,
        notifyDeadlines: true,
        notifyNews: false,
        // Reset preferences
        language: 'th',
        theme: 'light',
        dateFormat: 'thai',
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Settings reset to default successfully'
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset settings' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}