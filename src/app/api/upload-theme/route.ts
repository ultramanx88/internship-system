import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper function to calculate file hash
async function calculateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// Helper function to validate theme files
function validateThemeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'ประเภทไฟล์ไม่ถูกต้อง (รองรับ: JPG, PNG, GIF, WebP, SVG)' };
  }
  
  return { valid: true };
}

// Helper function to generate unique filename
function generateThemeFileName(originalName: string, type: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${name}_${timestamp}_${random}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์' },
        { status: 400 }
      );
    }

    if (!type || !['logo', 'background'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'ประเภทไฟล์ไม่ถูกต้อง (ต้องเป็น logo หรือ background)' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateThemeFile(file);
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
    
    // Generate file name and path
    const fileName = generateThemeFileName(file.name, type);
    const relativePath = `/assets/images/${fileName}`;
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

    // Clean up old files of the same type (keep only 5 most recent)
    try {
      const files = await require('fs').promises.readdir(dir);
      const typeFiles = files
        .filter(f => f.startsWith(`${type}_`))
        .map(f => ({
          name: f,
          path: path.join(dir, f),
          stats: require('fs').promises.stat(path.join(dir, f))
        }));
      
      // Sort by creation time (newest first)
      const sortedFiles = await Promise.all(typeFiles);
      sortedFiles.sort((a, b) => b.stats.mtime - a.stats.mtime);
      
      // Keep only 5 most recent, delete the rest
      for (let i = 5; i < sortedFiles.length; i++) {
        try {
          await unlink(sortedFiles[i].path);
        } catch (error) {
          console.warn('Failed to delete old theme file:', sortedFiles[i].name, error);
        }
      }
    } catch (error) {
      console.warn('Error cleaning old theme files:', error);
    }

    // Return public URL
    return NextResponse.json({
      success: true,
      url: relativePath,
      message: `อัปโหลด${type === 'logo' ? 'โลโก้' : 'ภาพพื้นหลัง'}สำเร็จ`,
      fileHash: fileHash.substring(0, 8) // Return first 8 chars of hash for reference
    });

  } catch (error) {
    console.error('Theme upload error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filePath } = await request.json();

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
    console.error('Theme delete error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  }
}
