'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, Download, Edit } from 'lucide-react'
import HtmlTemplateViewer from '@/components/admin/documents/HtmlTemplateViewer'

interface HtmlTemplate {
  id: string
  name: string
  path: string
  description: string
  category: string
  fields: Array<{
    id: string
    name: string
    type: 'text' | 'textarea' | 'date' | 'number'
    placeholder?: string
    required?: boolean
  }>
}

const HTML_TEMPLATES: HtmlTemplate[] = [
  {
    id: 'coop-application-form-th-v2',
    name: 'แบบฟอร์มขอฝึกสหกิจศึกษา (เหมือนต้นแบบ) ⭐',
    path: 'document-templates/co-op/th/แบบฟอร์มขอฝึกสหกิจ-เหมือนต้นแบบ-v2.html',
    description: 'เทมเพลตที่เหมือนต้นแบบมากที่สุด พร้อมดาวน์โหลด - แนะนำ!',
    category: 'สหกิจศึกษา',
    fields: [
      {
        id: 'student_name',
        name: 'ชื่อ-นามสกุล นักศึกษา',
        type: 'text',
        placeholder: 'เช่น นายสมชาย ใจดี',
        required: true
      },
      {
        id: 'student_id',
        name: 'รหัสนักศึกษา',
        type: 'text',
        placeholder: 'เช่น 6410001234',
        required: true
      },
      {
        id: 'faculty',
        name: 'คณะ',
        type: 'text',
        placeholder: 'เช่น คณะวิศวกรรมศาสตร์',
        required: true
      },
      {
        id: 'department',
        name: 'สาขาวิชา',
        type: 'text',
        placeholder: 'เช่น วิศวกรรมคอมพิวเตอร์',
        required: true
      },
      {
        id: 'year',
        name: 'ชั้นปี',
        type: 'number',
        placeholder: 'เช่น 3',
        required: true
      },
      {
        id: 'gpa',
        name: 'เกรดเฉลี่ย',
        type: 'text',
        placeholder: 'เช่น 3.25',
        required: true
      },
      {
        id: 'phone',
        name: 'เบอร์โทรศัพท์',
        type: 'text',
        placeholder: 'เช่น 081-234-5678',
        required: true
      },
      {
        id: 'email',
        name: 'อีเมล',
        type: 'text',
        placeholder: 'เช่น student@university.ac.th',
        required: true
      },
      {
        id: 'company_name',
        name: 'ชื่อบริษัท/หน่วยงาน',
        type: 'text',
        placeholder: 'เช่น บริษัท เทคโนโลยี จำกัด',
        required: true
      },
      {
        id: 'company_address',
        name: 'ที่อยู่บริษัท',
        type: 'textarea',
        placeholder: 'ที่อยู่ของบริษัท/หน่วยงาน',
        required: true
      },
      {
        id: 'supervisor_name',
        name: 'ชื่อพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น นายสมศักดิ์ วิชาการ',
        required: true
      },
      {
        id: 'supervisor_position',
        name: 'ตำแหน่งพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น ผู้จัดการฝ่ายเทคโนโลยี',
        required: true
      },
      {
        id: 'start_date',
        name: 'วันที่เริ่มฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'end_date',
        name: 'วันที่สิ้นสุดฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'application_date',
        name: 'วันที่ยื่นใบสมัคร',
        type: 'date',
        required: true
      }
    ]
  },
  {
    id: 'coop-application-form-th-pdf-style',
    name: 'แบบฟอร์มขอฝึกสหกิจศึกษา (PDF Style)',
    path: 'document-templates/co-op/th/แบบฟอร์มขอฝึกสหกิจ-PDF-Style.html',
    description: 'เทมเพลตแบบ PDF Style ที่ออกแบบมาอย่างดี',
    category: 'สหกิจศึกษา',
    fields: [
      {
        id: 'student_name',
        name: 'ชื่อ-นามสกุล นักศึกษา',
        type: 'text',
        placeholder: 'เช่น นายสมชาย ใจดี',
        required: true
      },
      {
        id: 'student_id',
        name: 'รหัสนักศึกษา',
        type: 'text',
        placeholder: 'เช่น 6410001234',
        required: true
      },
      {
        id: 'faculty',
        name: 'คณะ',
        type: 'text',
        placeholder: 'เช่น คณะวิศวกรรมศาสตร์',
        required: true
      },
      {
        id: 'department',
        name: 'สาขาวิชา',
        type: 'text',
        placeholder: 'เช่น วิศวกรรมคอมพิวเตอร์',
        required: true
      },
      {
        id: 'year',
        name: 'ชั้นปี',
        type: 'number',
        placeholder: 'เช่น 3',
        required: true
      },
      {
        id: 'gpa',
        name: 'เกรดเฉลี่ย',
        type: 'text',
        placeholder: 'เช่น 3.25',
        required: true
      },
      {
        id: 'phone',
        name: 'เบอร์โทรศัพท์',
        type: 'text',
        placeholder: 'เช่น 081-234-5678',
        required: true
      },
      {
        id: 'email',
        name: 'อีเมล',
        type: 'text',
        placeholder: 'เช่น student@university.ac.th',
        required: true
      },
      {
        id: 'company_name',
        name: 'ชื่อบริษัท/หน่วยงาน',
        type: 'text',
        placeholder: 'เช่น บริษัท เทคโนโลยี จำกัด',
        required: true
      },
      {
        id: 'company_address',
        name: 'ที่อยู่บริษัท',
        type: 'textarea',
        placeholder: 'ที่อยู่ของบริษัท/หน่วยงาน',
        required: true
      },
      {
        id: 'supervisor_name',
        name: 'ชื่อพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น นายสมศักดิ์ วิชาการ',
        required: true
      },
      {
        id: 'supervisor_position',
        name: 'ตำแหน่งพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น ผู้จัดการฝ่ายเทคโนโลยี',
        required: true
      },
      {
        id: 'start_date',
        name: 'วันที่เริ่มฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'end_date',
        name: 'วันที่สิ้นสุดฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'application_date',
        name: 'วันที่ยื่นใบสมัคร',
        type: 'date',
        required: true
      }
    ]
  },
  {
    id: 'coop-application-form-th-simple',
    name: 'แบบฟอร์มขอฝึกสหกิจศึกษา (แบบง่าย)',
    path: 'document-templates/co-op/th/แบบฟอร์มขอฝึกสหกิจ-เหมือนต้นแบบ.html',
    description: 'แบบฟอร์มแบบง่าย เหมาะสำหรับการใช้งานทั่วไป',
    category: 'สหกิจศึกษา',
    fields: [
      {
        id: 'student_name',
        name: 'ชื่อ-นามสกุล นักศึกษา',
        type: 'text',
        placeholder: 'เช่น นายสมชาย ใจดี',
        required: true
      },
      {
        id: 'student_id',
        name: 'รหัสนักศึกษา',
        type: 'text',
        placeholder: 'เช่น 6410001234',
        required: true
      },
      {
        id: 'faculty',
        name: 'คณะ',
        type: 'text',
        placeholder: 'เช่น คณะวิศวกรรมศาสตร์',
        required: true
      },
      {
        id: 'department',
        name: 'สาขาวิชา',
        type: 'text',
        placeholder: 'เช่น วิศวกรรมคอมพิวเตอร์',
        required: true
      },
      {
        id: 'year',
        name: 'ชั้นปี',
        type: 'number',
        placeholder: 'เช่น 3',
        required: true
      },
      {
        id: 'gpa',
        name: 'เกรดเฉลี่ย',
        type: 'text',
        placeholder: 'เช่น 3.25',
        required: true
      },
      {
        id: 'phone',
        name: 'เบอร์โทรศัพท์',
        type: 'text',
        placeholder: 'เช่น 081-234-5678',
        required: true
      },
      {
        id: 'email',
        name: 'อีเมล',
        type: 'text',
        placeholder: 'เช่น student@university.ac.th',
        required: true
      },
      {
        id: 'company_name',
        name: 'ชื่อบริษัท/หน่วยงาน',
        type: 'text',
        placeholder: 'เช่น บริษัท เทคโนโลยี จำกัด',
        required: true
      },
      {
        id: 'company_address',
        name: 'ที่อยู่บริษัท',
        type: 'textarea',
        placeholder: 'ที่อยู่ของบริษัท/หน่วยงาน',
        required: true
      },
      {
        id: 'supervisor_name',
        name: 'ชื่อพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น นายสมศักดิ์ วิชาการ',
        required: true
      },
      {
        id: 'supervisor_position',
        name: 'ตำแหน่งพี่เลี้ยง',
        type: 'text',
        placeholder: 'เช่น ผู้จัดการฝ่ายเทคโนโลยี',
        required: true
      },
      {
        id: 'start_date',
        name: 'วันที่เริ่มฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'end_date',
        name: 'วันที่สิ้นสุดฝึกงาน',
        type: 'date',
        required: true
      },
      {
        id: 'application_date',
        name: 'วันที่ยื่นใบสมัคร',
        type: 'date',
        required: true
      }
    ]
  }
]

export default function HtmlTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<HtmlTemplate | null>(null)

  const handleViewTemplate = (template: HtmlTemplate) => {
    setSelectedTemplate(template)
  }

  const handleBackToList = () => {
    setSelectedTemplate(null)
  }

  const handleSaveData = (data: Record<string, string>) => {
    console.log('Saved data:', data)
    // TODO: บันทึกข้อมูลลงฐานข้อมูล
  }

  if (selectedTemplate) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToList}>
            ← กลับไปรายการเทมเพลต
          </Button>
        </div>
        
        <HtmlTemplateViewer
          templatePath={selectedTemplate.path}
          templateName={selectedTemplate.name}
          fields={selectedTemplate.fields}
          onSave={handleSaveData}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">เทมเพลต HTML</h1>
        <p className="text-gray-600">
          จัดการและใช้งานเทมเพลต HTML สำหรับสร้างเอกสารต่างๆ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HTML_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">จำนวนฟิลด์:</span>
                  <span className="font-medium">{template.fields.length} ฟิลด์</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ประเภท:</span>
                  <span className="font-medium">HTML Template</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  ดูและแก้ไข
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {HTML_TEMPLATES.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่มีเทมเพลต HTML
            </h3>
            <p className="text-gray-500">
              ยังไม่มีเทมเพลต HTML ในระบบ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}