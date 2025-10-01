'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatThaiDateLong } from '@/lib/date-utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type DocumentType = 'cv' | 'transcript' | 'certificate' | 'request_letter' | 'introduction_letter' | 'application_form' | 'evaluation_form' | 'other';
type DocumentStatus = 'pending' | 'approved' | 'rejected';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadDate: Date;
  size: number;
  url?: string;
}

const documentTypes = {
  cv: 'CV/Resume',
  transcript: 'ใบแสดงผลการเรียน',
  certificate: 'หนังสือรับรอง',
  request_letter: 'หนังสือขอฝึกงาน/สหกิจ',
  introduction_letter: 'หนังสือส่งตัว',
  application_form: 'แบบฟอร์มสมัคร',
  evaluation_form: 'แบบฟอร์มประเมิน',
  other: 'เอกสารอื่นๆ'
};

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <AlertCircle className="h-4 w-4" />
};

const statusColors = {
  pending: 'bg-yellow-500 text-white',
  approved: 'bg-green-500 text-white',
  rejected: 'bg-red-500 text-white'
};

const statusTranslations = {
  pending: 'รอการตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ'
};

export default function StudentDocumentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('cv');
  
  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'CV_John_Doe.pdf',
      type: 'cv',
      status: 'approved',
      uploadDate: new Date('2024-01-15'),
      size: 245760
    },
    {
      id: '2',
      name: 'Transcript_2023.pdf',
      type: 'transcript',
      status: 'pending',
      uploadDate: new Date('2024-01-20'),
      size: 512000
    }
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'ไฟล์ใหญ่เกินไป',
        description: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB',
      });
      return;
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'ประเภทไฟล์ไม่ถูกต้อง',
        description: 'กรุณาเลือกไฟล์ PDF, Word, หรือรูปภาพเท่านั้น',
      });
      return;
    }

    setIsUploading(true);

    try {
      // TODO: ในระบบจริงจะอัพโหลดไฟล์ไปยัง server
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('type', selectedType);
      // const response = await fetch('/api/documents', { method: 'POST', body: formData });

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: selectedType,
        status: 'pending',
        uploadDate: new Date(),
        size: file.size
      };

      setDocuments(prev => [...prev, newDocument]);

      toast({
        title: 'อัพโหลดสำเร็จ',
        description: `ไฟล์ ${file.name} ได้รับการอัพโหลดเรียบร้อยแล้ว`,
      });

      // Reset input
      event.target.value = '';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัพโหลดไฟล์ได้',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: 'ลบไฟล์สำเร็จ',
      description: 'เอกสารได้รับการลบออกจากระบบแล้ว',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">จัดการเอกสาร</h1>
        <p>อัพโหลดและจัดการเอกสารประกอบการสมัครฝึกงาน</p>
      </div>



      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>อัพโหลดเอกสารใหม่</CardTitle>
          <CardDescription>
            อัพโหลดเอกสารประกอบการสมัครฝึกงาน (รองรับไฟล์ PDF, Word, รูปภาพ ขนาดไม่เกิน 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document-type">ประเภทเอกสาร</Label>
              <select
                id="document-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(documentTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="file-upload">เลือกไฟล์</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Upload className="h-4 w-4 animate-pulse" />
              <span>กำลังอัพโหลด...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>เอกสารของฉัน</CardTitle>
          <CardDescription>รายการเอกสารที่อัพโหลดแล้ว</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-600 hover:bg-primary-600">
                  <TableHead className="text-white">ชื่อไฟล์</TableHead>
                  <TableHead className="text-white">ประเภท</TableHead>
                  <TableHead className="text-white">ขนาด</TableHead>
                  <TableHead className="text-white">วันที่อัพโหลด</TableHead>
                  <TableHead className="text-center text-white">สถานะ</TableHead>
                  <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>{documentTypes[doc.type]}</TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell>{formatThaiDateLong(doc.uploadDate)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${statusColors[doc.status]}`}>
                          {statusIcons[doc.status]}
                          <span className="ml-2">{statusTranslations[doc.status]}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      ยังไม่มีเอกสารที่อัพโหลด
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle>เอกสารแบบฟอร์ม</CardTitle>
          <CardDescription>ดาวน์โหลดแบบฟอร์มเอกสารสำหรับการสมัครฝึกงานและสหกิจศึกษา</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Internship Templates */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">📋 เอกสารฝึกงาน (Internship)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">หนังสือขอฝึกงาน</p>
                    <p className="text-sm text-muted-foreground">Request Letter</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/internship/th/01_หนังสือขอฝึกงาน.pdf" target="_blank">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/internship/th/01_หนังสือขอฝึกงาน.docx" download>
                        <Download className="h-4 w-4 mr-1" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">หนังสือส่งตัวฝึกงาน</p>
                    <p className="text-sm text-muted-foreground">Introduction Letter</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/internship/th/02_หนังสือส่งตัวฝึกงาน.pdf" target="_blank">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/internship/th/02_หนังสือส่งตัวฝึกงาน.docx" download>
                        <Download className="h-4 w-4 mr-1" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Co-op Templates */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">🎓 เอกสารสหกิจศึกษา (Co-op)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">แบบฟอร์มขอสหกิจศึกษา</p>
                    <p className="text-sm text-muted-foreground">Application Form</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/01_แบบฟอร์มขอสหกิจศึกษา.pdf" target="_blank">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/01_แบบฟอร์มขอสหกิจศึกษา.docx" download>
                        <Download className="h-4 w-4 mr-1" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">หนังสือขอสหกิจศึกษา</p>
                    <p className="text-sm text-muted-foreground">Request Letter</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/02_หนังสือขอสหกิจศึกษา.pdf" target="_blank">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/02_หนังสือขอสหกิจศึกษา.docx" download>
                        <Download className="h-4 w-4 mr-1" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">หนังสือส่งตัวสหกิจศึกษา</p>
                    <p className="text-sm text-muted-foreground">Introduction Letter</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/03_หนังสือส่งตัวสหกิจศึกษา.pdf" target="_blank">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/document-templates/co-op/th/03_หนังสือส่งตัวสหกิจศึกษา.docx" download>
                        <Download className="h-4 w-4 mr-1" />
                        Word
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Info */}
      <Card>
        <CardHeader>
          <CardTitle>เอกสารที่จำเป็น</CardTitle>
          <CardDescription>เอกสารที่ต้องเตรียมสำหรับการสมัครฝึกงาน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">เอกสารบังคับ:</h4>
              <ul className="space-y-1 text-sm">
                <li>• CV/Resume (ภาษาไทยหรืออังกฤษ)</li>
                <li>• ใบแสดงผลการเรียนล่าสุด</li>
                <li>• หนังสือรับรองการเป็นนักศึกษา</li>
                <li>• เอกสารแบบฟอร์มที่กรอกข้อมูลแล้ว (ดาวน์โหลดจากด้านบน)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">เอกสารเสริม (ถ้ามี):</h4>
              <ul className="space-y-1 text-sm">
                <li>• ใบรับรองผลงาน/โครงการ</li>
                <li>• ใบรับรองทักษะ/หลักสูตร</li>
                <li>• Portfolio หรือผลงาน</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}