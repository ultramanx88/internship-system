'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Download, Eye, Search, Calendar, User } from 'lucide-react'

interface GeneratedDocument {
  id: string
  filename: string
  templateName: string
  createdBy: string
  createdAt: string
  size: string
  type: 'html' | 'pdf' | 'docx'
  status: 'completed' | 'processing' | 'error'
}

// Mock data - ในการใช้งานจริงจะดึงจากฐานข้อมูล
const MOCK_DOCUMENTS: GeneratedDocument[] = [
  {
    id: '1',
    filename: 'แบบฟอร์มขอฝึกสหกิจ_สมชาย_2024-01-15.html',
    templateName: 'แบบฟอร์มขอฝึกสหกิจศึกษา (ไทย)',
    createdBy: 'นายสมชาย ใจดี',
    createdAt: '2024-01-15T10:30:00Z',
    size: '45 KB',
    type: 'html',
    status: 'completed'
  },
  {
    id: '2',
    filename: 'แบบฟอร์มขอฝึกสหกิจ_สมหญิง_2024-01-14.html',
    templateName: 'แบบฟอร์มขอฝึกสหกิจศึกษา (ไทย)',
    createdBy: 'นางสาวสมหญิง รักเรียน',
    createdAt: '2024-01-14T14:20:00Z',
    size: '43 KB',
    type: 'html',
    status: 'completed'
  },
  {
    id: '3',
    filename: 'หนังสือส่งตัว_สมศักดิ์_2024-01-13.html',
    templateName: 'หนังสือส่งตัวสหกิจศึกษา',
    createdBy: 'นายสมศักดิ์ ขยันเรียน',
    createdAt: '2024-01-13T09:15:00Z',
    size: '38 KB',
    type: 'html',
    status: 'completed'
  }
]

export default function GeneratedDocumentsPage() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>(MOCK_DOCUMENTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDocuments, setFilteredDocuments] = useState<GeneratedDocument[]>(MOCK_DOCUMENTS)

  useEffect(() => {
    const filtered = documents.filter(doc =>
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDocuments(filtered)
  }, [searchTerm, documents])

  const handleDownload = async (doc: GeneratedDocument) => {
    try {
      // ในการใช้งานจริงจะเรียก API เพื่อดาวน์โหลดไฟล์
      console.log('Downloading:', doc.filename)
      
      // Mock download
      const link = document.createElement('a')
      link.href = '#'
      link.download = doc.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handlePreview = (document: GeneratedDocument) => {
    // ในการใช้งานจริงจะเปิดหน้าต่างใหม่เพื่อแสดงตัวอย่าง
    console.log('Previewing:', document.filename)
    window.open(`/api/documents/preview/${document.id}`, '_blank')
  }

  const getStatusBadge = (status: GeneratedDocument['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>
      case 'processing':
        return <Badge variant="secondary">กำลังประมวลผล</Badge>
      case 'error':
        return <Badge variant="destructive">ข้อผิดพลาด</Badge>
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>
    }
  }

  const getTypeIcon = (type: GeneratedDocument['type']) => {
    switch (type) {
      case 'html':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-800" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">เอกสารที่สร้างแล้ว</h1>
        <p className="text-gray-600">
          จัดการและดาวน์โหลดเอกสารที่สร้างจากเทมเพลต
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาเอกสาร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(document.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {document.filename}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {document.templateName}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{document.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(document.createdAt)}</span>
                      </div>
                      <span>{document.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(document.status)}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(document)}
                      disabled={document.status !== 'completed'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      ดูตัวอย่าง
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleDownload(document)}
                      disabled={document.status !== 'completed'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      ดาวน์โหลด
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบเอกสาร
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'ไม่พบเอกสารที่ตรงกับคำค้นหา' : 'ยังไม่มีเอกสารที่สร้างแล้ว'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              เอกสารทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              เสร็จสิ้นแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              วันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {documents.filter(d => 
                new Date(d.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}