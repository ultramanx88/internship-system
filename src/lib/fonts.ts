// ระบบจัดการฟอนต์สำหรับ PDF
// Note: Server-side functions are moved to separate API endpoints

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
 * โหลดฟอนต์จาก URL (client-side)
 */
export async function loadFontFromUrl(fontUrl: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(fontUrl)
    if (!response.ok) {
      console.log(`Font not found: ${fontUrl}`)
      return null
    }
    return await response.arrayBuffer()
  } catch (error) {
    console.error(`Error loading font: ${fontUrl}`, error)
    return null
  }
}

/**
 * รับรายการฟอนต์ที่ใช้ได้ (client-side)
 */
export function getAvailableFonts(): FontInfo[] {
  // Return all fonts - availability will be checked via API
  return AVAILABLE_FONTS
}

/**
 * หาฟอนต์ที่เหมาะสมสำหรับภาษาไทย
 */
export function getBestThaiFont(): FontInfo | null {
  // ลำดับความสำคัญ (ให้ TH Sarabun New เป็นอันดับแรกเพราะอัปโหลดแล้ว)
  const priority = ['TH Sarabun New', 'Sarabun', 'Noto Sans Thai']
  
  for (const fontName of priority) {
    const font = AVAILABLE_FONTS.find(f => f.name === fontName)
    if (font) return font
  }
  
  return AVAILABLE_FONTS.length > 0 ? AVAILABLE_FONTS[0] : null
}