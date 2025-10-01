'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Download, Search, Filter, Globe } from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  filename: string
  path: string
  type: 'pdf' | 'docx' | 'txt'
  category: 'co-op' | 'internship'
  language: 'th' | 'en'
  description: string
  size?: string
  fields: string[]
}

// สร้างรายการเทมเพลตจากโครงสร้างไฟล์
const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // Co-op Thai Templates
  {
    id: 'coop-th-01',
    name: 'แบบฟอร์มขอสหกิจศึกษา',
    filename: '01_แบบฟอร์มขอสหกิจศึกษา.pdf',
    path: 'document-templates/co-op/th/01_แบบฟอร์มขอสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'th',
    description: 'แบบฟอร์มสำหรับนักศึกษาขอฝึกสหกิจศึกษา',
    fields: ['student_name', 'student_id', 'faculty', 'department', 'year', 'gpa', 'phone', 'email', 'company_name', 'company_address', 'supervisor_name', 'supervisor_position', 'start_date', 'end_date', 'application_date']
  },
  {
    id: 'coop-th-02',
    name: 'หนังสือขอสหกิจศึกษา',
    filename: '02_หนังสือขอสหกิจศึกษา.pdf',
    path: 'document-templates/co-op/th/02_หนังสือขอสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'th',
    description: 'หนังสือขอความอนุเคราะห์ฝึกสหกิจศึกษา',
    fields: ['company_name', 'company_address', 'student_name', 'student_id', 'department', 'supervisor_name', 'start_date', 'end_date']
  },
  {
    id: 'coop-th-03',
    name: 'หนังสือส่งตัวสหกิจศึกษา',
    filename: '03_หนังสือส่งตัวสหกิจศึกษา.pdf',
    path: 'document-templates/co-op/th/03_หนังสือส่งตัวสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'th',
    description: 'หนังสือส่งตัวนักศึกษาฝึกสหกิจศึกษา',
    fields: ['student_name', 'student_id', 'department', 'company_name', 'company_address', 'supervisor_name', 'start_date', 'end_date']
  },
  {
    id: 'coop-th-04',
    name: 'แบบฟอร์มประเมินสหกิจศึกษา',
    filename: '04_แบบฟอร์มประเมินสหกิจศึกษา.pdf',
    path: 'document-templates/co-op/th/04_แบบฟอร์มประเมินสหกิจศึกษา.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'th',
    description: 'แบบฟอร์มประเมินผลการฝึกสหกิจศึกษา',
    fields: ['student_name', 'student_id', 'company_name', 'supervisor_name', 'evaluation_period', 'skills_rating', 'performance_rating']
  },
  // Co-op English Templates
  {
    id: 'coop-en-01',
    name: 'Application Form Cooperative Education',
    filename: '01_Application_Form_Cooperative_Education.pdf',
    path: 'document-templates/co-op/en/01_Application_Form_Cooperative_Education.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'en',
    description: 'Application form for cooperative education program',
    fields: ['student_name', 'student_id', 'faculty', 'department', 'year', 'gpa', 'phone', 'email', 'company_name', 'company_address', 'supervisor_name', 'supervisor_position', 'start_date', 'end_date', 'application_date']
  },
  {
    id: 'coop-en-02',
    name: 'Request Letter Cooperative Education',
    filename: '02_Request_Letter_Cooperative_Education.pdf',
    path: 'document-templates/co-op/en/02_Request_Letter_Cooperative_Education.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'en',
    description: 'Request letter for cooperative education placement',
    fields: ['company_name', 'company_address', 'student_name', 'student_id', 'department', 'supervisor_name', 'start_date', 'end_date']
  },
  {
    id: 'coop-en-03',
    name: 'Introduction Letter Cooperative Education',
    filename: '03_Introduction_Letter_Cooperative_Education.pdf',
    path: 'document-templates/co-op/en/03_Introduction_Letter_Cooperative_Education.pdf',
    type: 'pdf',
    category: 'co-op',
    language: 'en',
    description: 'Introduction letter for cooperative education student',
    fields: ['student_name', 'student_id', 'department', 'company_name', 'company_address', 'supervisor_name', 'start_date', 'end_date']
  },
  // Internship Thai Templates
  {
    id: 'internship-th-01',
    name: 'หนังสือขอฝึกงาน',
    filename: '01_หนังสือขอฝึกงาน.pdf',
    path: 'document-templates/internship/th/01_หนังสือขอฝึกงาน.pdf',
    type: 'pdf',
    category: 'internship',
    language: 'th',
    description: 'หนังสือขอความอนุเคราะห์ฝึกงาน',
    fields: ['company_name', 'company_address', 'student_name', 'student_id', 'department', 'start_date', 'end_date']
  },
  {
    id: 'internship-th-02',
    name: 'หนังสือส่งตัวฝึกงาน',
    filename: '02_หนังสือส่งตัวฝึกงาน.pdf',
    path: 'document-templates/internship/th/02_หนังสือส่งตัวฝึกงาน.pdf',
    type: 'pdf',
    category: 'internship',
    language: 'th',
    description: 'หนังสือส่งตัวนักศึกษาฝึกงาน',
    fields: ['student_name', 'student_id', 'department', 'company_name', 'company_address', 'start_date', 'end_date']
  },
  // Internship English Templates
  {
    id: 'internship-en-01',
    name: 'Request Letter Internship',
    filename: '01_Request_Letter_Internship.pdf',
    path: 'document-templates/internship/en/01_Request_Letter_Internship.pdf',
    type: 'pdf',
    category: 'internship',
    language: 'en',
    description: 'Request letter for internship placement',
    fields: ['company_name', 'company_address', 'student_name', 'student_id', 'department', 'start_date', 'end_date']
  },
  {
    id: 'internship-en-02',
    name: 'Introduction Letter Internship',
    filename: '02_Introduction_Letter_Internship.pdf',
    path: 'document-templates/internship/en/02_Introduction_Letter_Internship.pdf',
    type: 'pdf',
    category: 'internship',
    language: 'en',
    description: 'Introduction letter for internship student',
    fields: ['student_name', 'student_id', 'department', 'company_name', 'company_address', 'start_date', 'end_date']
  }
]

interface DocumentTemplateManagerProps {
  onSelectTemplate?: (template: DocumentTemplate) => void
}

export default function DocumentTemplateManager({ onSelectTemplate }: DocumentTemplateManagerProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(DOCUMENT_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>(DOCUMENT_TEMPLATES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Filter templates
  useEffect(() => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(template => template.language === selectedLanguage)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType)
    }

    setFilteredTemplates(filtered)
  }, [searchTerm, selectedCategory, selectedLanguage, selectedType, templates])

  const handlePreview = async (template: DocumentTemplate) => {
    try {
      const apiPath = template.type === 'pdf' ? '/api/templates/pdf' : '/api/templates/docx'
      const url = `${apiPath}?path=${encodeURIComponent(template.path)}`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error previewing template:', error)
    }
  }

  const handleUseTemplate = (template: DocumentTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      docx: 'bg-blue-100 text-blue-800',
      txt: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.txt}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline">
        {category === 'co-op' ? 'สหกิจศึกษา' : 'ฝึกงาน'}
      </Badge>
    )
  }

  const getLanguageBadge = (language: string) => {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Globe className="w-3 h-3" />
        {language === 'th' ? 'ไทย' : 'EN'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">เทมเพลตเอกสารทั้งหมด</h2>
          <p className="text-gray-600">
            จัดการและใช้งานเทมเพลตเอกสารสำหรับฝึกงานและสหกิจศึกษา
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาเทมเพลต..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                <SelectItem value="co-op">สหกิจศึกษา</SelectItem>
                <SelectItem value="internship">ฝึกงาน</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="ภาษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกภาษา</SelectItem>
                <SelectItem value="th">ไทย</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="ประเภทไฟล์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
              </SelectContent>
            </Select>
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
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {getTypeBadge(template.type)}
                      {getCategoryBadge(template.category)}
                      {getLanguageBadge(template.language)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ไฟล์:</span>
                  <span className="font-medium text-xs">{template.filename}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ฟิลด์ข้อมูล:</span>
                  <span className="font-medium">{template.fields.length} ฟิลด์</span>
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
                  พรีวิว
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ใช้งาน
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
              ไม่พบเทมเพลตที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-sm text-gray-600">เทมเพลตทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {templates.filter(t => t.type === 'pdf').length}
            </div>
            <p className="text-sm text-gray-600">PDF Templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.language === 'th').length}
            </div>
            <p className="text-sm text-gray-600">เทมเพลตภาษาไทย</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.category === 'co-op').length}
            </div>
            <p className="text-sm text-gray-600">สหกิจศึกษา</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}