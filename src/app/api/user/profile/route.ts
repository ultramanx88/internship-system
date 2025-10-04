import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // ดึง user ID จาก header
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        profileImage: true,
        educatorRoleId: true,
        educatorRole: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            description: true,
            isActive: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // แปลง roles จาก JSON string เป็น array
    const userWithParsedRoles = {
      ...user,
      roles: JSON.parse(user.roles)
    };
    
    return NextResponse.json(userWithParsedRoles);
  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileImage } = body;
    
    // ดึง user ID จาก header
    const userId = request.headers.get('x-user-id');
    
    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!profileImage) {
      return NextResponse.json(
        { success: false, error: 'Profile image URL is required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า user มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // อัปเดต profile image ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: profileImage,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// เพิ่ม DELETE method สำหรับลบรูปโปรไฟล์
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ลบรูปโปรไฟล์
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: null,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete profile image' },
      { status: 500 }
    );
  }
}