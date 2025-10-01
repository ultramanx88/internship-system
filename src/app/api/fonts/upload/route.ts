import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('font') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No font file provided' },
        { status: 400 }
      )
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.name.endsWith('.ttf') && !file.name.endsWith('.otf')) {
      return NextResponse.json(
        { error: 'Invalid font file type. Only .ttf and .otf are supported.' },
        { status: 400 }
      )
    }

    // สร้างโฟลเดอร์ fonts หากไม่มี
    const fontsDir = join(process.cwd(), 'public', 'fonts')
    if (!existsSync(fontsDir)) {
      await mkdir(fontsDir, { recursive: true })
    }

    // บันทึกไฟล์
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(fontsDir, file.name)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      message: 'Font uploaded successfully',
      filename: file.name,
      path: `public/fonts/${file.name}`
    })
  } catch (error) {
    console.error('Error uploading font:', error)
    return NextResponse.json(
      { error: 'Failed to upload font' },
      { status: 500 }
    )
  }
}