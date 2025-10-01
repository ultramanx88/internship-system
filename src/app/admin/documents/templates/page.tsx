'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Download, Eye, Search, Plus, Trash2 } from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  filename: string
  type: 'pdf' | 'docx' | 'html'
  category: string
  description: string
  size: string
  uploadedAt: string
  downloadCount: number
}

// Mock data
const MOCK_TEMPLATES: DocumentTemplate[] = [
  {
    id: '1',
    name: 'แบบฟอร์มขอสหกิจศึกษา',
    filename: '01_แบบฟอร์มขอสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'สหกิจศึกษา',
    description: 'แบบฟอร์มสำหรับนักศึกษาขอฝึกสหกิจศึกษา',
    size: '245 KB',
    uploadedAt: '2024-01-10T09:00:00Z',
    downloadCount: 45
  },
  {
    id: '2',
    name: 'หนังสือขอสหกิจศึกษา',
    filename: '02_หนังสือขอสหกิจศึกษา.docx',
    type: 'docx',
    category: 'สหกิจศึกษา',
    description: 'หนังสือขอความอนุเคราะห์ฝึกสหกิจศึกษา',
    size: '128 KB',
    uploadedAt: '2024-01-10T09:15:00Z',
    downloadCount: 32
  },
  {
    id: '3',
    name: 'หนังสือส่งตัวสหกิจศึกษา',
    filename: '03_หนังสือส่งตัวสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'สหกิจศึกษา',
    description: 'หนังสือส่งตัวนักศึกษาฝึกสหกิจศึกษา',
    size: '198 KB',
    uploadedAt: '2024-01-10T09:30:00Z',
    downloadCount: 28
  },
  {
    id: '4',
    name: 'แบบฟอร์มประเมินสหกิจศึกษา',
    filename: '04_แบบฟอร์มประเมินสหกิจศึกษา.docx',
    type: 'docx',
    category: 'สหกิจศึกษา',
    description: 'แบบฟอร์มประเมินผลการฝึกสหกิจศึกษา',
    size: '156 KB',
    uploadedAt: '2024-01-10T10:00:00Z',
    downloadCount: 19
  }
]

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(MOCK_TEMPLATES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDownload = async (template: DocumentTemplate) => {
    try {
      // ในการใช้งานจริงจะเรียก API เพื่อดาวน์โหลดไฟล์
      console.log('Downloading:', template.filename)
      
      // อัปเดตจำนวนการดาวน์โหลด
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, downloadCount: t.downloadCount + 1 }
          : t
      ))
    } catch (error) {
      console.error('Error downloading template:', error)
    }
  }

  const handlePreview = (template: DocumentTemplate) => {
    console.log('Previewing:', template.filename)
    // เปิดไฟล์ในหน้าต่างใหม่
    window.open(`/document-templates/${template.category.toLowerCase()}/${template.filename}`, '_blank')
  }

  const handleDelete = (templateId: string) => {
    if (confirm('คุณต้องการลบเทมเพลตนี้หรือไม่?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    }
  }

  const getTypeIcon = (type: DocumentTemplate['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-800" />
      case 'html':
        return <FileText className="w-5 h-5 text-blue-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: DocumentTemplate['type']) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      docx: 'bg-blue-100 text-blue-800',
      html: 'bg-green-100 text-green-800'
    }
    return (
      <Badge className={colors[type]}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">เทมเพลตเอกสาร</h1>
            <p className="text-gray-600">
              จัดการเทมเพลตเอกสารสำหรับการฝึกงานและสหกิจศึกษา
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มเทมเพลต
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาเทมเพลต..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(template.type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                    <div className="flex gap-2">
                      {getTypeBadge(template.type)}
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ขนาดไฟล์:</span>
                  <span className="font-medium">{template.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">อัปโหลดเมื่อ:</span>
                  <span className="font-medium">{formatDate(template.uploadedAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ดาวน์โหลด:</span>
                  <span className="font-medium">{template.downloadCount} ครั้ง</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  ดู
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(template)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบเทมเพลต
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'ไม่พบเทมเพลตที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีเทมเพลตในระบบ'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              เทมเพลตทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {templates.filter(t => t.type === 'pdf').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              DOCX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.type === 'docx').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ดาวน์โหลดรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.reduce((sum, t) => sum + t.downloadCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}