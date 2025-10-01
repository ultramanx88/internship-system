import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templatePath = searchParams.get('path')

    if (!templatePath) {
      return NextResponse.json(
        { error: 'Template path is required' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าเป็นไฟล์ PDF ในโฟลเดอร์ document-templates
    if (!templatePath.startsWith('document-templates/') || !templatePath.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid template path' },
        { status: 400 }
      )
    }

    const fullPath = join(process.cwd(), templatePath)
    const content = await readFile(fullPath)

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    })
  } catch (error) {
    console.error('Error reading PDF template:', error)
    return NextResponse.json(
      { error: 'Failed to read PDF template file' },
      { status: 500 }
    )
  }
}