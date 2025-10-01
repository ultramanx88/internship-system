'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, Download, Edit } from 'lucide-react'
import PdfTemplateViewer from '@/components/admin/documents/PdfTemplateViewer'

interface PdfTemplate {
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

const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: 'coop-application-form-pdf',
    name: 'แบบฟอร์มขอฝึกสหกิจศึกษา (PDF)',
    path: 'document-templates/co-op/th/01_แบบฟอร์มขอสหกิจศึกษา.pdf',
    description: 'เทมเพลต PDF ต้นแบบสำหรับเติมข้อมูลและสร้างเอกสาร',
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

export default function PdfTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(null)

  const handleViewTemplate = (template: PdfTemplate) => {
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
        
        <PdfTemplateViewer
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
        <h1 className="text-3xl font-bold mb-2">เทมเพลต PDF</h1>
        <p className="text-gray-600">
          จัดการและใช้งานเทมเพลต PDF สำหรับเติมข้อมูลและสร้างเอกสาร
        </p>
      </div>

      {/* Features Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">เหมือนต้นแบบ 100%</h3>
                <p className="text-sm text-blue-700">ใช้ไฟล์ PDF จริง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">คุณภาพสูง</h3>
                <p className="text-sm text-green-700">ไม่เสียคุณภาพ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">ง่ายต่อการใช้</h3>
                <p className="text-sm text-purple-700">เติมข้อมูลและดาวน์โหลด</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PDF_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
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
                  <span className="font-medium">PDF Template</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ไฟล์:</span>
                  <span className="font-medium text-xs">{template.path.split('/').pop()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  ใช้งาน
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {PDF_TEMPLATES.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่มีเทมเพลต PDF
            </h3>
            <p className="text-gray-500">
              ยังไม่มีเทมเพลต PDF ในระบบ
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>วิธีการใช้งานเทมเพลต PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">ข้อดีของ PDF Template:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  เหมือนต้นแบบ 100%
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  คุณภาพสูง ไม่เสียคุณภาพ
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  รองรับฟอนต์ภาษาไทย
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ง่ายต่อการจัดการ
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">ขั้นตอนการใช้งาน:</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>เลือกเทมเพลตที่ต้องการ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>คลิก "ใช้งาน" เพื่อเปิดเทมเพลต</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>กรอกข้อมูลในฟอร์ม</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                  <span>ดาวน์โหลด PDF ที่เติมข้อมูลแล้ว</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}