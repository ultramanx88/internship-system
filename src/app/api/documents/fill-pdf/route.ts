import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PDFDocument, PDFTextField, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { getBestThaiFont, DEFAULT_FONTS } from '@/lib/fonts'
import { loadFont } from '@/lib/fonts-server'

export async function POST(request: NextRequest) {
  try {
    const { templatePath, data, filename } = await request.json()

    if (!templatePath || !data || !filename) {
      return NextResponse.json(
        { error: 'Template path, data, and filename are required' },
        { status: 400 }
      )
    }

    // อ่านไฟล์ PDF template
    const fullTemplatePath = join(process.cwd(), templatePath)
    const pdfBytes = await readFile(fullTemplatePath)

    // โหลด PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)
    
    // Register fontkit สำหรับการใช้ฟอนต์ภาษาไทย
    pdfDoc.registerFontkit(fontkit)

    // โหลดฟอนต์ภาษาไทยที่ดีที่สุด
    let thaiFont
    try {
      const bestFont = getBestThaiFont()
      if (bestFont) {
        console.log(`Using Thai font: ${bestFont.name}`)
        const fontBytes = await loadFont(bestFont.path)
        if (fontBytes) {
          thaiFont = await pdfDoc.embedFont(fontBytes)
        } else {
          throw new Error('Failed to load font bytes')
        }
      } else {
        throw new Error('No Thai font available')
      }
    } catch (error) {
      console.log('Thai font not available, using Helvetica:', error.message)
      thaiFont = await pdfDoc.embedFont(DEFAULT_FONTS.helvetica)
    }

    // ดึง form จาก PDF
    const form = pdfDoc.getForm()
    const fields = form.getFields()

    console.log('Available PDF fields:', fields.map(field => field.getName()))

    // เติมข้อมูลลงในฟิลด์ต่างๆ
    Object.entries(data).forEach(([key, value]) => {
      try {
        // ลองหาฟิลด์ที่ตรงกับ key
        const field = form.getField(key)
        if (field instanceof PDFTextField) {
          field.setText(String(value) || '')
          field.updateAppearances(thaiFont)
        }
      } catch (error) {
        // ถ้าไม่มีฟิลด์นี้ ข้ามไป
        console.log(`Field ${key} not found in PDF`)
      }
    })

    // ลองเติมข้อมูลด้วยชื่อฟิลด์ที่เป็นไปได้
    const fieldMappings = {
      'student_name': ['ชื่อ', 'name', 'student_name', 'studentName', 'ชื่อนักศึกษา'],
      'student_id': ['รหัส', 'id', 'student_id', 'studentId', 'รหัสนักศึกษา'],
      'faculty': ['คณะ', 'faculty', 'คณะวิชา'],
      'department': ['สาขา', 'department', 'สาขาวิชา'],
      'year': ['ชั้นปี', 'year', 'ปี'],
      'gpa': ['เกรด', 'gpa', 'เกรดเฉลี่ย'],
      'phone': ['โทร', 'phone', 'เบอร์', 'เบอร์โทร'],
      'email': ['อีเมล', 'email', 'e-mail'],
      'company_name': ['บริษัท', 'company', 'company_name', 'ชื่อบริษัท'],
      'company_address': ['ที่อยู่', 'address', 'company_address', 'ที่อยู่บริษัท'],
      'supervisor_name': ['พี่เลี้ยง', 'supervisor', 'supervisor_name', 'ชื่อพี่เลี้ยง'],
      'supervisor_position': ['ตำแหน่ง', 'position', 'supervisor_position', 'ตำแหน่งพี่เลี้ยง'],
      'start_date': ['วันเริ่ม', 'start_date', 'startDate', 'วันที่เริ่ม'],
      'end_date': ['วันสิ้นสุด', 'end_date', 'endDate', 'วันที่สิ้นสุด'],
      'application_date': ['วันที่', 'date', 'application_date', 'วันที่ยื่น']
    }

    Object.entries(fieldMappings).forEach(([dataKey, possibleFieldNames]) => {
      const value = data[dataKey]
      if (value) {
        possibleFieldNames.forEach(fieldName => {
          try {
            const field = form.getField(fieldName)
            if (field instanceof PDFTextField) {
              field.setText(String(value))
              field.updateAppearances(thaiFont)
            }
          } catch (error) {
            // ฟิลด์ไม่มี ข้ามไป
          }
        })
      }
    })

    // ถ้าไม่มีฟิลด์ในฟอร์ม ให้เพิ่มข้อความลงในหน้า PDF
    if (fields.length === 0) {
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]
      const { width, height } = firstPage.getSize()

      // เพิ่มข้อความในตำแหน่งที่กำหนด (ต้องปรับตำแหน่งตามต้นแบบ)
      const fontSize = 12
      let yPosition = height - 200

      // เพิ่มข้อมูลนักศึกษา
      if (data.student_name) {
        firstPage.drawText(`ชื่อ: ${data.student_name}`, {
          x: 100,
          y: yPosition,
          size: fontSize,
          font: thaiFont,
          color: rgb(0, 0, 0),
        })
        yPosition -= 20
      }

      if (data.student_id) {
        firstPage.drawText(`รหัสนักศึกษา: ${data.student_id}`, {
          x: 100,
          y: yPosition,
          size: fontSize,
          font: thaiFont,
          color: rgb(0, 0, 0),
        })
        yPosition -= 20
      }

      // เพิ่มข้อมูลอื่นๆ ตามต้องการ
    }

    // บันทึกไฟล์ PDF ที่เติมข้อมูลแล้ว
    const pdfBytesOutput = await pdfDoc.save()

    // สร้างโฟลเดอร์ generated-documents หากไม่มี
    const outputDir = join(process.cwd(), 'generated-documents')
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // บันทึกไฟล์
    const outputPath = join(outputDir, filename)
    await writeFile(outputPath, pdfBytesOutput)

    // ส่งไฟล์กลับ
    return new NextResponse(pdfBytesOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error filling PDF:', error)
    return NextResponse.json(
      { error: 'Failed to fill PDF document', details: error.message },
      { status: 500 }
    )
  }
}