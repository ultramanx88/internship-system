'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, AlertCircle, X, Edit, Save } from 'lucide-react'

interface TemplateField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'date' | 'number'
  placeholder?: string
  required?: boolean
  value?: string
}

interface PdfTemplateViewerProps {
  templatePath: string
  templateName: string
  fields?: TemplateField[]
  onSave?: (data: Record<string, string>) => void
}

export default function PdfTemplateViewer({
  templatePath,
  templateName,
  fields = [],
  onSave
}: PdfTemplateViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  // เริ่มต้นข้อมูลฟอร์ม
  useEffect(() => {
    const initialData: Record<string, string> = {}
    fields.forEach(field => {
      initialData[field.id] = field.value || ''
    })
    setFormData(initialData)
  }, [fields])

  // โหลด PDF template เพื่อแสดงตัวอย่าง
  useEffect(() => {
    const loadPdfPreview = async () => {
      try {
        const response = await fetch(`/api/templates/pdf?path=${encodeURIComponent(templatePath)}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
        }
      } catch (error) {
        console.error('Error loading PDF preview:', error)
      }
    }

    loadPdfPreview()

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [templatePath])

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

  const handleFillPdf = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // สร้างชื่อไฟล์
      const studentName = formData.student_name || 'นักศึกษา'
      const date = new Date().toISOString().split('T')[0]
      const filename = `แบบฟอร์มขอฝึกสหกิจ_${studentName}_${date}.pdf`

      const response = await fetch('/api/documents/fill-pdf', {
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
        
        alert('ดาวน์โหลด PDF เรียบร้อยแล้ว!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error filling PDF:', error)
      setError(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewWithData = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/documents/fill-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templatePath,
          data: formData,
          filename: 'preview.pdf'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        // เปิดในหน้าต่างใหม่
        window.open(url, '_blank')
        
        // Cleanup หลังจาก 5 วินาที
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 5000)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      setError('ไม่สามารถสร้างตัวอย่างได้')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{templateName}</h2>
          <p className="text-gray-600">เทมเพลต PDF สำหรับเติมข้อมูลและสร้างเอกสาร</p>
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
          <Button 
            onClick={handlePreviewWithData}
            disabled={isLoading}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            ดูตัวอย่าง
          </Button>
          <Button 
            onClick={handleFillPdf}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

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

        {/* PDF Preview Panel */}
        <Card className={isEditing && fields.length > 0 ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ตัวอย่าง PDF Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-gray-100">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-96"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">กำลังโหลด PDF...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลเทมเพลต PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">ชื่อไฟล์</Label>
              <p className="text-sm">{templatePath.split('/').pop()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ประเภท</Label>
              <Badge variant="secondary">PDF Template</Badge>
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
              <span>คลิก "แก้ไข" เพื่อเปิดฟอร์มกรอกข้อมูล</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
              <span>กรอกข้อมูลในฟิลด์ต่างๆ ให้ครบถ้วน</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
              <span>คลิก "ดูตัวอย่าง" เพื่อดู PDF ที่เติมข้อมูลแล้ว</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
              <span>คลิก "ดาวน์โหลด PDF" เพื่อบันทึกไฟล์</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}