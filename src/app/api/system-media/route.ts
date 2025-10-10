import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Helper function to calculate file hash
async function calculateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// Helper function to validate system media files
function validateSystemMediaFile(file: File, type: string): { valid: boolean; error?: string } {
  const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logo, 5MB for background
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${type === 'logo' ? '2MB' : '5MB'})` 
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับ: JPG, PNG, GIF, WebP, SVG)' 
    };
  }
  
  return { valid: true };
}

// Helper function to generate unique filename
function generateSystemMediaFileName(originalName: string, type: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${name}_${timestamp}_${random}${ext}`;
}

// Helper function to get image dimensions
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    console.warn('Could not get image dimensions:', error);
    return null;
  }
}

// GET - ดึงข้อมูลไฟล์ระบบทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'logo', 'background', 'favicon'
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};
    if (type) where.type = type;
    if (activeOnly) where.isActive = true;

    // Try to get from database, fallback to empty array if error
    try {
      const systemMedia = await prisma.systemMedia.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: systemMedia
      });
    } catch (dbError) {
      console.warn('Database access failed, using empty array:', dbError.message);
      return NextResponse.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Get system media error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์ระบบ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - อัปโหลดไฟล์ระบบ
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์' },
        { status: 400 }
      );
    }

    if (!type || !['logo', 'background', 'favicon'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'ประเภทไฟล์ไม่ถูกต้อง (ต้องเป็น logo, background หรือ favicon)' },
        { status: 400 }
      );
    }

    if (!uploadedBy) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลผู้อัปโหลด' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateSystemMediaFile(file, type);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Calculate file hash
    const fileHash = await calculateFileHash(buffer);
    
    // Get image dimensions
    const dimensions = await getImageDimensions(buffer);
    
    // Generate file name and path
    const fileName = generateSystemMediaFileName(file.name, type);
    const relativePath = `/assets/images/system/${fileName}`;
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    // Create directory if not exists
    const dir = path.dirname(fullPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Check if file already exists (by hash)
    if (existsSync(fullPath)) {
      const existingBuffer = await require('fs').promises.readFile(fullPath);
      const existingHash = await calculateFileHash(existingBuffer);
      
      if (existingHash === fileHash) {
        return NextResponse.json({
          success: true,
          url: relativePath,
          message: 'ไฟล์นี้มีอยู่แล้ว ใช้ไฟล์เดิม',
          isDuplicate: true
        });
      }
    }

    // Save file
    await writeFile(fullPath, buffer);

    // Deactivate old files of the same type
    await prisma.systemMedia.updateMany({
      where: { type, isActive: true },
      data: { isActive: false }
    });

    // Save to database
    const systemMedia = await prisma.systemMedia.create({
      data: {
        type,
        name: fileName,
        originalName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        width: dimensions?.width,
        height: dimensions?.height,
        isActive: true,
        uploadedBy
      }
    });

    // Clean up old files (keep only 5 most recent per type)
    try {
      const oldFiles = await prisma.systemMedia.findMany({
        where: { 
          type,
          isActive: false 
        },
        orderBy: { createdAt: 'desc' },
        skip: 5 // Keep only 5 most recent
      });

      for (const oldFile of oldFiles) {
        const oldFilePath = path.join(process.cwd(), 'public', oldFile.filePath);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
        await prisma.systemMedia.delete({
          where: { id: oldFile.id }
        });
      }
    } catch (error) {
      console.warn('Error cleaning old system media files:', error);
    }

    // Return public URL
    return NextResponse.json({
      success: true,
      url: relativePath,
      message: `อัปโหลด${type === 'logo' ? 'โลโก้' : type === 'background' ? 'ภาพพื้นหลัง' : 'favicon'}สำเร็จ`,
      data: systemMedia,
      fileHash: fileHash.substring(0, 8)
    });

  } catch (error) {
    console.error('System media upload error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ระบบ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - ลบไฟล์ระบบ
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ของไฟล์' },
        { status: 400 }
      );
    }

    const systemMedia = await prisma.systemMedia.findUnique({
      where: { id }
    });

    if (!systemMedia) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์ที่ต้องการลบ' },
        { status: 404 }
      );
    }

    // Delete physical file
    const fullPath = path.join(process.cwd(), 'public', systemMedia.filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    // Delete from database
    await prisma.systemMedia.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'ลบไฟล์ระบบสำเร็จ'
    });

  } catch (error) {
    console.error('System media delete error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบไฟล์ระบบ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
