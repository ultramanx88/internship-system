import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['admin', 'staff', 'courseInstructor', 'committee', 'student']);
    if ('error' in auth) return auth.error;
    const { user } = auth;
    
    // Get complete user data with all necessary fields for registration check
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return complete user data
    const completeUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      roles: JSON.parse(dbUser.roles),
      profileImage: dbUser.profileImage,
      // Fields needed for registration check
      phone: dbUser.phone,
      t_name: dbUser.t_name,
      t_surname: dbUser.t_surname,
      e_name: dbUser.e_name,
      e_surname: dbUser.e_surname,
      facultyId: dbUser.facultyId,
      departmentId: dbUser.departmentId,
      curriculumId: dbUser.curriculumId,
      majorId: dbUser.majorId,
      // Additional fields
      t_title: dbUser.t_title,
      t_middle_name: dbUser.t_middle_name,
      e_title: dbUser.e_title,
      e_middle_name: dbUser.e_middle_name,
      studentYear: dbUser.studentYear,
      campus: dbUser.campus,
      gpa: dbUser.gpa,
      nationality: dbUser.nationality,
      passportId: dbUser.passportId,
      visaType: dbUser.visaType,
      skills: dbUser.skills,
      statement: dbUser.statement,
      notifyEmail: dbUser.notifyEmail,
      notifyPush: dbUser.notifyPush,
      notifySms: dbUser.notifySms,
      notifyAppUpdates: dbUser.notifyAppUpdates,
      notifyDeadlines: dbUser.notifyDeadlines,
      notifyNews: dbUser.notifyNews,
      language: dbUser.language,
      theme: dbUser.theme,
      dateFormat: dbUser.dateFormat,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      user: completeUser
    });
  } catch (error) {
    console.error('Error getting complete user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get complete user data' },
      { status: 500 }
    );
  } finally {
    await cleanup();
  }
}
