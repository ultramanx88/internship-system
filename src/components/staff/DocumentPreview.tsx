'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Printer, Download, FileText, Calendar, User, Building } from 'lucide-react';

interface DocumentPreviewProps {
  application: {
    id: string;
    dateApplied: string;
    projectTopic?: string;
    student: {
      id: string;
      name: string;
      email: string;
      t_name?: string;
      e_name?: string;
    };
    internship: {
      id: string;
      title: string;
      company: {
        name: string;
        address: string;
      };
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentPreview({ application, isOpen, onClose }: DocumentPreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // เปิดหน้าต่างพิมพ์
    window.print();
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // สร้าง PDF และดาวน์โหลด
    // TODO: Implement PDF generation
    setTimeout(() => {
      setIsDownloading(false);
      alert('ดาวน์โหลดเอกสารเรียบร้อย');
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentNumber = () => {
    // สร้างเลขที่เอกสาร (ตัวอย่าง)
    const year = new Date().getFullYear() + 543; // พ.ศ.
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `กท-${year}${month}${day}-${random}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            เอกสารขอฝึกงาน
          </DialogTitle>
          <DialogDescription>
            รายละเอียดเอกสารขอฝึกงานของนักศึกษา
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ข้อมูลเอกสาร */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลเอกสาร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">เลขที่เอกสาร</Label>
                  <p className="text-lg font-semibold">{getDocumentNumber()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">วันที่ออกเอกสาร</Label>
                  <p className="text-lg">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลนักศึกษา */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                ข้อมูลนักศึกษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">รหัสนักศึกษา</Label>
                  <p className="text-lg">{application.student.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</Label>
                  <p className="text-lg">
                    {application.student.t_name || application.student.e_name || application.student.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">อีเมล</Label>
                  <p className="text-lg">{application.student.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">วันที่สมัคร</Label>
                  <p className="text-lg">{formatDate(application.dateApplied)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลการฝึกงาน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="h-5 w-5 mr-2" />
                ข้อมูลการฝึกงาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ตำแหน่งการฝึกงาน</Label>
                  <p className="text-lg font-semibold">{application.internship.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">บริษัท</Label>
                  <p className="text-lg">{application.internship.company.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ที่อยู่บริษัท</Label>
                  <p className="text-lg">{application.internship.company.address}</p>
                </div>
                {application.projectTopic && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">หัวข้อโครงการ</Label>
                    <p className="text-lg">{application.projectTopic}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* เนื้อหาเอกสาร */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">เนื้อหาเอกสาร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-center mb-6">
                  หนังสือขอความอนุเคราะห์การฝึกงาน
                </h3>
                
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    เรียน ผู้อำนวยการ{application.internship.company.name}
                  </p>
                  
                  <p>
                    ตามที่มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี ได้จัดการเรียนการสอนในหลักสูตรวิศวกรรมคอมพิวเตอร์ 
                    โดยมีวัตถุประสงค์เพื่อผลิตบัณฑิตที่มีความรู้ความสามารถในสาขาวิชาชีพ และสามารถนำความรู้ไปประยุกต์ใช้ในงานจริงได้
                  </p>
                  
                  <p>
                    บัดนี้ นักศึกษา{application.student.t_name || application.student.e_name || application.student.name} 
                    รหัส {application.student.id} กำลังศึกษาอยู่ในชั้นปีที่ 4 
                    ต้องการฝึกงานในตำแหน่ง {application.internship.title} 
                    ณ {application.internship.company.name} 
                    เพื่อเพิ่มพูนประสบการณ์และทักษะในการทำงานจริง
                  </p>
                  
                  {application.projectTopic && (
                    <p>
                      โดยมีหัวข้อโครงการที่สนใจคือ "{application.projectTopic}"
                    </p>
                  )}
                  
                  <p>
                    จึงเรียนมาเพื่อขอความอนุเคราะห์ให้นักศึกษาดังกล่าวได้ฝึกงานในตำแหน่งที่ระบุ 
                    ตามระยะเวลาที่เหมาะสม และหวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่าน
                  </p>
                  
                  <p>
                    ขอแสดงความนับถือ
                  </p>
                  
                  <div className="mt-8">
                    <p className="text-center">
                      (ลงชื่อ) ................................................
                    </p>
                    <p className="text-center text-sm text-gray-500">
                      ผู้อำนวยการหลักสูตรวิศวกรรมคอมพิวเตอร์
                    </p>
                    <p className="text-center text-sm text-gray-500">
                      มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'กำลังพิมพ์...' : 'พิมพ์เอกสาร'}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
