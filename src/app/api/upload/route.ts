import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FileStorageService } from '@/lib/file-storage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to calculate file hash
async function calculateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// Helper function to clean old profile images
async function cleanOldProfileImages(userId: string, currentFilePath: string) {
  try {
    const userDir = path.dirname(path.join(process.cwd(), 'public', currentFilePath));
    
    if (existsSync(userDir)) {
      const files = await readdir(userDir);
      const profileFiles = files.filter(file => 
        file.startsWith(`profile_${userId}_`) && 
        !currentFilePath.endsWith(file)
      );
      
      // Keep only the 2 most recent files, delete the rest
      if (profileFiles.length > 2) {
        const fileStats = await Promise.all(
          profileFiles.map(async (file) => {
            const filePath = path.join(userDir, file);
            const stats = await stat(filePath);
            return { file, path: filePath, mtime: stats.mtime };
          })
        );
        
        // Sort by modification time (newest first)
        fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        
        // Delete old files (keep only 2 newest)
        const filesToDelete = fileStats.slice(2);
        for (const fileInfo of filesToDelete) {
          try {
            await unlink(fileInfo.path);
            console.log('Deleted old profile image:', fileInfo.file);
          } catch (error) {
            console.warn('Failed to delete old file:', fileInfo.file, error);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error cleaning old profile images:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์หรือ User ID' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = FileStorageService.validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Calculate file hash to check for duplicates
    const fileHash = await calculateFileHash(buffer);
    
    // Check if user already has this exact file
    const userDir = path.join(process.cwd(), 'public/uploads/profiles');
    const userDirPattern = path.join(userDir, '*', '*', userId);
    
    // Check for duplicate files by hash
    let isDuplicate = false;
    let existingFilePath = '';
    
    try {
      // Simple duplicate check - compare with current profile image if exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true }
      });
      
      if (user?.profileImage) {
        const existingFullPath = path.join(process.cwd(), 'public', user.profileImage);
        if (existsSync(existingFullPath)) {
          const existingBuffer = await require('fs').promises.readFile(existingFullPath);
          const existingHash = await calculateFileHash(existingBuffer);
          
          if (existingHash === fileHash) {
            isDuplicate = true;
            existingFilePath = user.profileImage;
          }
        }
      }
    } catch (error) {
      console.warn('Error checking for duplicates:', error);
    }
    
    // If duplicate found, return existing file
    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        url: existingFilePath,
        message: 'ไฟล์นี้มีอยู่แล้ว ใช้ไฟล์เดิม',
        isDuplicate: true
      });
    }

    // Generate file name and path
    const fileName = FileStorageService.generateFileName(userId, file.name);
    const relativePath = FileStorageService.getFilePath(userId, fileName);
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    // Create directory if not exists
    const dir = path.dirname(fullPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Save new file
    await writeFile(fullPath, buffer);

    // Clean old profile images (keep only 2 most recent)
    await cleanOldProfileImages(userId, relativePath);

    // Update user's profile image in database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: relativePath }
      });
    } catch (error) {
      console.warn('Failed to update user profile image in database:', error);
    }

    // Return public URL
    return NextResponse.json({
      success: true,
      url: relativePath,
      message: 'อัปโหลดไฟล์สำเร็จ',
      fileHash: fileHash.substring(0, 8) // Return first 8 chars of hash for reference
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filePath, userId } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ path ของไฟล์' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);

    // Check if file exists before deleting
    if (existsSync(fullPath)) {
      await unlink(fullPath);
      
      // Update user's profile image in database if this was a profile image
      if (userId && filePath.includes('profile_')) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { profileImage: null }
          });
        } catch (error) {
          console.warn('Failed to update user profile image in database:', error);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'ลบไฟล์สำเร็จ'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบไฟล์ที่ต้องการลบ'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}