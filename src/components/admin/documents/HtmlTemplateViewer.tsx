'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Eye, Download, Edit, Save, X } from 'lucide-react'

interface TemplateField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'date' | 'number'
  placeholder?: string
  required?: boolean
  value?: string
}

interface HtmlTemplateViewerProps {
  templatePath: string
  templateName: string
  fields?: TemplateField[]
  onSave?: (data: Record<string, string>) => void
}

export default function HtmlTemplateViewer({
  templatePath,
  templateName,
  fields = [],
  onSave
}: HtmlTemplateViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState<string>('')

  // โหลดเทมเพลต HTML
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/html?path=${encodeURIComponent(templatePath)}`)
        if (response.ok) {
          const content = await response.text()
          setHtmlContent(content)
          setPreviewHtml(content)
        } else {
          console.error('Failed to load template')
        }
      } catch (error) {
        console.error('Error loading template:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplate()
  }, [templatePath])

  // เริ่มต้นข้อมูลฟอร์ม
  useEffect(() => {
    const initialData: Record<string, string> = {}
    fields.forEach(field => {
      initialData[field.id] = field.value || ''
    })
    setFormData(initialData)
  }, [fields])

  // อัปเดตตัวอย่างเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (htmlContent && Object.keys(formData).length > 0) {
      let updatedHtml = htmlContent
      
      // แทนที่ placeholder ด้วยข้อมูลจริง
      Object.entries(formData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        updatedHtml = updatedHtml.replace(regex, value || `[${key}]`)
      })
      
      setPreviewHtml(updatedHtml)
    }
  }, [htmlContent, formData])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    setIsEditing(false)
  }

  const handleDownload = async () => {
    try {
      // สร้างชื่อไฟล์ที่เหมาะสม
      const studentName = formData.student_name || 'นักศึกษา'
      const date = new Date().toISOString().split('T')[0]
      const filename = `แบบฟอร์มขอฝึกสหกิจ_${studentName}_${date}.html`

      const response = await fetch('/api/documents/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templatePath,
          data: formData,
          filename
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)
        
        // แสดงข้อความสำเร็จ
        alert('ดาวน์โหลดเอกสารเรียบร้อยแล้ว!')
      } else {
        throw new Error('Failed to generate document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่อีกครั้ง')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{templateName}</h2>
          <p className="text-gray-600">เทมเพลต HTML สำหรับสร้างเอกสาร</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'ยกเลิก' : 'แก้ไข'}
          </Button>
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          )}
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลด
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        {isEditing && fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลแบบฟอร์ม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Preview Panel */}
        <Card className={isEditing && fields.length > 0 ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              ตัวอย่างเอกสาร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">ตัวอย่างเอกสาร</span>
                <span className="text-xs text-gray-500">ขนาด A4</span>
              </div>
              <div className="p-4 bg-gray-100">
                <div 
                  className="bg-white shadow-lg mx-auto overflow-auto"
                  style={{
                    width: '595px',
                    height: '842px',
                    transform: 'scale(0.6)',
                    transformOrigin: 'top center',
                    marginBottom: '-200px'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลเทมเพลต</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">ชื่อไฟล์</Label>
              <p className="text-sm">{templatePath.split('/').pop()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ประเภท</Label>
              <Badge variant="secondary">HTML Template</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">จำนวนฟิลด์</Label>
              <p className="text-sm">{fields.length} ฟิลด์</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">สถานะ</Label>
              <Badge variant="outline" className="text-green-600">พร้อมใช้งาน</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}