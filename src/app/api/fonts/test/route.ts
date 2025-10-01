import { NextResponse } from 'next/server'
import { AVAILABLE_FONTS, getBestThaiFont } from '@/lib/fonts'
import { getAvailableFonts, loadFont } from '@/lib/fonts-server'

export async function GET() {
  try {
    const availableFonts = getAvailableFonts(AVAILABLE_FONTS)
    const bestFont = getBestThaiFont()
    
    // ทดสอบโหลดฟอนต์
    let fontTestResult = null
    if (bestFont) {
      try {
        const fontBytes = await loadFont(bestFont.path)
        fontTestResult = {
          success: fontBytes !== null,
          size: fontBytes ? fontBytes.byteLength : 0,
          font: bestFont.name
        }
      } catch (error) {
        fontTestResult = {
          success: false,
          error: error.message,
          font: bestFont.name
        }
      }
    }

    return NextResponse.json({
      availableFonts: availableFonts.length,
      fontsList: availableFonts.map(f => ({
        name: f.name,
        filename: f.filename,
        exists: true
      })),
      bestFont: bestFont?.name || 'None',
      fontTest: fontTestResult,
      status: 'success'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to test fonts',
        details: error.message,
        status: 'error'
      },
      { status: 500 }
    )
  }
}