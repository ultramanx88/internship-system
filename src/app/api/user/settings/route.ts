import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // ดึง user ID จาก header
    const userId = request.headers.get('x-user-id');
    
    console.log('Settings API - User ID:', userId);
    
    if (!userId) {
      console.log('Settings API - No user ID provided');
      return NextResponse.json(
        { success: false, error: 'User ID is required', details: 'x-user-id header is missing' },
        { status: 400 }
      );
    }
    
    console.log('Settings API - Querying database for user:', userId);
    
    // ค้นหาผู้ใช้พร้อม relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    console.log('Settings API - Database query result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('Settings API - User not found in database:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found', details: `No user found with ID: ${userId}` },
        { status: 404 }
      );
    }
    
    // แปลงข้อมูลให้ตรงกับ format ที่ frontend ต้องการ
    const settings = {
      // ข้อมูลภาษาไทย
      thaiTitle: user.t_title || '',
      thaiName: user.t_name || '',
      thaiMiddleName: user.t_middle_name || '',
      thaiSurname: user.t_surname || '',
      // ข้อมูลภาษาอังกฤษ
      englishTitle: user.e_title || '',
      englishName: user.e_name || '',
      englishMiddleName: user.e_middle_name || '',
      englishSurname: user.e_surname || '',
      // ข้อมูลอื่นๆ
      email: user.email,
      phone: user.phone || '',
      studentId: user.id,
      faculty: user.faculty?.nameTh || '',
      department: user.department?.nameTh || '',
      program: user.curriculum?.nameTh || '',
      major: user.major?.nameTh || '',
      campus: user.campus || '',
      gpa: user.gpa || '',
      nationality: user.nationality || 'ไทย',
      passportId: user.passportId || '',
      visaType: user.visaType || 'none',
      skills: user.skills || '',
      statement: user.statement || '',
      // การตั้งค่าการแจ้งเตือน
      notifications: {
        email: user.notifyEmail ?? true,
        push: user.notifyPush ?? false,
        sms: user.notifySms ?? false,
        applicationUpdates: user.notifyAppUpdates ?? true,
        deadlineReminders: user.notifyDeadlines ?? true,
        systemNews: user.notifyNews ?? false
      },
      // การตั้งค่าทั่วไป
      preferences: {
        language: user.language || 'th',
        theme: user.theme || 'light',
        dateFormat: user.dateFormat || 'thai'
      }
    };
    
    // ตรวจสอบและแสดงข้อมูลในคอนโซล
    console.log('API Settings - Full user data:', user);
    console.log('API Settings - Full settings data:', settings);
    console.log('Settings API - Returning settings for user:', user.id);
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
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // ข้อมูลส่วนตัว
        t_title: body.thaiTitle,
        t_name: body.thaiName,
        t_middle_name: body.thaiMiddleName,
        t_surname: body.thaiSurname,
        e_title: body.englishTitle,
        e_name: body.englishName,
        e_middle_name: body.englishMiddleName,
        e_surname: body.englishSurname,
        email: body.email,
        phone: body.phone,
        campus: body.campus,
        gpa: body.gpa,
        nationality: body.nationality,
        passportId: body.passportId,
        visaType: body.visaType,
        skills: body.skills,
        statement: body.statement,
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
    await prisma.$disconnect();
  }
}

// เพิ่ม DELETE method สำหรับลบการตั้งค่า (reset to default)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'test001';
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Reset settings to default values
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
    await prisma.$disconnect();
  }
}