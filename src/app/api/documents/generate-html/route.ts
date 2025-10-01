import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { templatePath, data, filename } = await request.json()

    if (!templatePath || !data || !filename) {
      return NextResponse.json(
        { error: 'Template path, data, and filename are required' },
        { status: 400 }
      )
    }

    // อ่านเทมเพลต HTML
    const fullTemplatePath = join(process.cwd(), templatePath)
    let htmlContent = await readFile(fullTemplatePath, 'utf-8')

    // แทนที่ placeholder ด้วยข้อมูลจริง
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      htmlContent = htmlContent.replace(regex, String(value) || `[${key}]`)
    })

    // แทนที่ input values ด้วยข้อมูลจริง
    Object.entries(data).forEach(([key, value]) => {
      const inputRegex = new RegExp(`value="{{${key}}}"`, 'g')
      htmlContent = htmlContent.replace(inputRegex, `value="${String(value) || ''}"`)
      
      const placeholderRegex = new RegExp(`placeholder="{{${key}}}"`, 'g')
      htmlContent = htmlContent.replace(placeholderRegex, `placeholder="${String(value) || ''}" value="${String(value) || ''}"`)
    })

    // เพิ่มข้อมูลเมตาและสไตล์สำหรับการพิมพ์
    const enhancedHtml = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body {
            font-family: 'Sarabun', 'TH SarabunPSK', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .generated-info {
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 10px;
            color: #666;
            background: rgba(255,255,255,0.8);
            padding: 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    ${htmlContent.replace(/<body[^>]*>|<\/body>/gi, '')}
    <div class="generated-info no-print">
        สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}
    </div>
</body>
</html>`

    // สร้างโฟลเดอร์ generated-documents หากไม่มี
    const outputDir = join(process.cwd(), 'generated-documents')
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // บันทึกไฟล์
    const outputPath = join(outputDir, filename)
    await writeFile(outputPath, enhancedHtml, 'utf-8')

    // ส่งไฟล์กลับ
    return new NextResponse(enhancedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating document:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}