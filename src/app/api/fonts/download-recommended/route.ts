import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST() {
  try {
    // สร้างโฟลเดอร์ fonts หากไม่มี
    const fontsDir = join(process.cwd(), 'public', 'fonts')
    if (!existsSync(fontsDir)) {
      await mkdir(fontsDir, { recursive: true })
    }

    // ดาวน์โหลดฟอนต์ Sarabun จาก Google Fonts
    const fonts = [
      {
        name: 'Sarabun-Regular.ttf',
        url: 'https://fonts.gstatic.com/s/sarabun/v13/DtVhJx26TKEqsc-lWJNJ.ttf'
      }
    ]

    const downloadedFonts = []

    for (const font of fonts) {
      try {
        const response = await fetch(font.url)
        if (response.ok) {
          const fontBuffer = await response.arrayBuffer()
          const filePath = join(fontsDir, font.name)
          
          await writeFile(filePath, Buffer.from(fontBuffer))
          downloadedFonts.push(font.name)
        }
      } catch (error) {
        console.error(`Error downloading ${font.name}:`, error)
      }
    }

    if (downloadedFonts.length > 0) {
      return NextResponse.json({
        message: 'Fonts downloaded successfully',
        fonts: downloadedFonts
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to download any fonts' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error downloading recommended fonts:', error)
    return NextResponse.json(
      { error: 'Failed to download recommended fonts' },
      { status: 500 }
    )
  }
}