import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { existsSync, unlink, rmdir } from 'fs';
import { readdir } from 'fs/promises';

/**
 * DELETE /api/upload/user-media
 * ลบไฟล์มีเดียทั้งหมดของผู้ใช้ (รูปโปรไฟล์ + รูปฝึกงาน)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ User ID' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        profileImage: true,
        internshipPhoto1: true,
        internshipPhoto2: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ใช้งาน' },
        { status: 404 }
      );
    }

    const baseDir = process.cwd();
    const uploadsDir = path.join(baseDir, 'public', 'uploads');
    
    // ลบไฟล์และโฟลเดอร์ทั้งหมดของผู้ใช้
    const mediaTypes = ['profiles', 'internships', 'documents'];
    let deletedFiles = 0;
    let deletedFolders = 0;

    for (const mediaType of mediaTypes) {
      const mediaDir = path.join(uploadsDir, mediaType);
      
      if (existsSync(mediaDir)) {
        // หาโฟลเดอร์ปี/เดือน/ผู้ใช้
        const yearDirs = await readdir(mediaDir).catch(() => []);
        
        for (const yearDir of yearDirs) {
          const yearPath = path.join(mediaDir, yearDir);
          if (existsSync(yearPath)) {
            const monthDirs = await readdir(yearPath).catch(() => []);
            
            for (const monthDir of monthDirs) {
              const monthPath = path.join(yearPath, monthDir);
              if (existsSync(monthPath)) {
                const userDir = path.join(monthPath, userId);
                
                if (existsSync(userDir)) {
                  try {
                    // ลบไฟล์ทั้งหมดในโฟลเดอร์ผู้ใช้
                    const files = await readdir(userDir);
                    for (const file of files) {
                      const filePath = path.join(userDir, file);
                      try {
                        await unlink(filePath);
                        deletedFiles++;
                      } catch (error) {
                        console.warn(`Failed to delete file ${filePath}:`, error);
                      }
                    }
                    
                    // ลบโฟลเดอร์ผู้ใช้
                    await rmdir(userDir);
                    deletedFolders++;
                    
                    // ลบโฟลเดอร์เดือนถ้าไม่มีไฟล์อื่น
                    try {
                      const remainingFiles = await readdir(monthPath);
                      if (remainingFiles.length === 0) {
                        await rmdir(monthPath);
                      }
                    } catch (error) {
                      // Ignore if can't delete month folder
                    }
                    
                    // ลบโฟลเดอร์ปีถ้าไม่มีไฟล์อื่น
                    try {
                      const remainingMonthDirs = await readdir(yearPath);
                      if (remainingMonthDirs.length === 0) {
                        await rmdir(yearPath);
                      }
                    } catch (error) {
                      // Ignore if can't delete year folder
                    }
                    
                  } catch (error) {
                    console.warn(`Failed to delete user directory ${userDir}:`, error);
                  }
                }
              }
            }
          }
        }
      }
    }

    // อัปเดตฐานข้อมูลให้เป็น null
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: null,
        internshipPhoto1: null,
        internshipPhoto2: null
      }
    });

    return NextResponse.json({
      success: true,
      message: `ลบไฟล์มีเดียของผู้ใช้สำเร็จ (${deletedFiles} ไฟล์, ${deletedFolders} โฟลเดอร์)`,
      deletedFiles,
      deletedFolders
    });

  } catch (error) {
    console.error('Delete user media error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบไฟล์มีเดีย' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
