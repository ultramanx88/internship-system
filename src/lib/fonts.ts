// ระบบจัดการฟอนต์สำหรับ PDF
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface FontInfo {
  name: string
  filename: string
  path: string
  description: string
  supports: string[]
}

// รายการฟอนต์ที่รองรับ
export const AVAILABLE_FONTS: FontInfo[] = [
  {
    name: 'TH Sarabun New',
    filename: 'THSarabunNew.ttf',
    path: 'public/fonts/THSarabunNew.ttf',
    description: 'ฟอนต์ TH Sarabun New สำหรับเอกสารราชการ (อัปโหลดแล้ว)',
    supports: ['thai', 'english', 'numbers']
  },
  {
    name: 'TH Sarabun New Bold',
    filename: 'THSarabunNew Bold.ttf',
    path: 'public/fonts/THSarabunNew Bold.ttf',
    description: 'ฟอนต์ TH Sarabun New ตัวหนา (อัปโหลดแล้ว)',
    supports: ['thai', 'english', 'numbers']
  },
  {
    name: 'TH Sarabun New Italic',
    filename: 'THSarabunNew Italic.ttf',
    path: 'public/fonts/THSarabunNew Italic.ttf',
    description: 'ฟอนต์ TH Sarabun New ตัวเอียง (อัปโหลดแล้ว)',
    supports: ['thai', 'english', 'numbers']
  },
  {
    name: 'TH Sarabun New Bold Italic',
    filename: 'THSarabunNew BoldItalic.ttf',
    path: 'public/fonts/THSarabunNew BoldItalic.ttf',
    description: 'ฟอนต์ TH Sarabun New ตัวหนาเอียง (อัปโหลดแล้ว)',
    supports: ['thai', 'english', 'numbers']
  },
  {
    name: 'Sarabun',
    filename: 'Sarabun-Regular.ttf',
    path: 'public/fonts/Sarabun-Regular.ttf',
    description: 'ฟอนต์ Sarabun สำหรับภาษาไทย (แนะนำ)',
    supports: ['thai', 'english', 'numbers']
  },
  {
    name: 'Noto Sans Thai',
    filename: 'NotoSansThai-Regular.ttf',
    path: 'public/fonts/NotoSansThai-Regular.ttf',
    description: 'ฟอนต์ Noto Sans Thai จาก Google',
    supports: ['thai', 'english', 'numbers']
  }
]

// ฟอนต์ default ที่ใช้ได้เสมอ
export const DEFAULT_FONTS = {
  helvetica: 'Helvetica',
  times: 'Times-Roman',
  courier: 'Courier'
}

/**
 * โหลดฟอนต์จากไฟล์
 */
export async function loadFont(fontPath: string): Promise<ArrayBuffer | null> {
  try {
    const fullPath = join(process.cwd(), fontPath)
    
    if (!existsSync(fullPath)) {
      console.log(`Font file not found: ${fullPath}`)
      return null
    }

    const fontBytes = await readFile(fullPath)
    return fontBytes.buffer
  } catch (error) {
    console.error(`Error loading font: ${fontPath}`, error)
    return null
  }
}

/**
 * ดาวน์โหลดฟอนต์จาก Google Fonts
 */
export async function downloadGoogleFont(fontFamily: string, outputPath: string): Promise<boolean> {
  try {
    // URL สำหรับดาวน์โหลดฟอนต์จาก Google Fonts
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400&display=swap`
    
    // ในการใช้งานจริง ควรใช้ library สำหรับดาวน์โหลดฟอนต์
    console.log(`Would download font from: ${googleFontsUrl}`)
    console.log(`To: ${outputPath}`)
    
    return true
  } catch (error) {
    console.error('Error downloading font:', error)
    return false
  }
}

/**
 * ตรวจสอบว่าฟอนต์มีอยู่หรือไม่
 */
export function checkFontExists(fontPath: string): boolean {
  const fullPath = join(process.cwd(), fontPath)
  return existsSync(fullPath)
}

/**
 * รับรายการฟอนต์ที่ใช้ได้
 */
export function getAvailableFonts(): FontInfo[] {
  return AVAILABLE_FONTS.filter(font => checkFontExists(font.path))
}

/**
 * หาฟอนต์ที่เหมาะสมสำหรับภาษาไทย
 */
export function getBestThaiFont(): FontInfo | null {
  const availableFonts = getAvailableFonts()
  
  // ลำดับความสำคัญ (ให้ TH Sarabun New เป็นอันดับแรกเพราะอัปโหลดแล้ว)
  const priority = ['TH Sarabun New', 'Sarabun', 'Noto Sans Thai']
  
  for (const fontName of priority) {
    const font = availableFonts.find(f => f.name === fontName)
    if (font) return font
  }
  
  return availableFonts.length > 0 ? availableFonts[0] : null
}