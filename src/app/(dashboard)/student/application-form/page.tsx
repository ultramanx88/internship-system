'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, GraduationCap, Clock, Calendar } from 'lucide-react';

export default function ApplicationFormPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'internship' | 'co_op' | null>(null);

  const handleSelectType = (type: 'internship' | 'co_op') => {
    setSelectedType(type);
    // Navigate to the form page with the selected type
    router.push(`/student/application-form/${type}`);
  };

  return (
    <div className="space-y-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">สมัครฝึกงาน/สหกิจศึกษา</h1>
        <p>เลือกประเภทการฝึกงานที่ต้องการสมัคร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Internship Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl text-secondary-foreground">ฝึกงาน</CardTitle>
            <CardDescription>Internship</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">ระยะเวลา: 2-4 เดือน</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">ช่วงปิดเทอม</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-sm">ไม่นับหน่วยกิต</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="font-semibold mb-2">เหมาะสำหรับ:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• นักศึกษาที่ต้องการประสบการณ์เสริม</li>
                <li>• ฝึกทักษะเฉพาะด้าน</li>
                <li>• สร้างเครือข่ายในวงการ</li>
              </ul>
            </div>

            <Button 
              onClick={() => handleSelectType('internship')}
              className="w-full"
            >
              เลือกฝึกงาน
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Co-op Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-secondary/20 rounded-full w-fit">
              <GraduationCap className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-xl text-secondary-foreground">สหกิจศึกษา</CardTitle>
            <CardDescription>Cooperative Education</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-sm">ระยะเวลา: 4-6 เดือน</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                <span className="text-sm">เทอมการศึกษา</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-secondary" />
                <span className="text-sm">นับหน่วยกิต 6 หน่วยกิต</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="font-semibold mb-2">เหมาะสำหรับ:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• นักศึกษาชั้นปีสุดท้าย</li>
                <li>• ต้องการประสบการณ์เชิงลึก</li>
                <li>• มีโครงการพิเศษ</li>
              </ul>
            </div>

            <Button 
              onClick={() => handleSelectType('co_op')}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              เลือกสหกิจศึกษา
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>ข้อมูลสำคัญ</CardTitle>
          <CardDescription>สิ่งที่ควรรู้ก่อนสมัคร</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-primary">📋 เอกสารที่ต้องเตรียม</h4>
              <ul className="space-y-2 text-sm">
                <li>• CV/Resume</li>
                <li>• ใบแสดงผลการเรียน</li>
                <li>• หนังสือรับรองการเป็นนักศึกษา</li>
                <li>• หนังสือขอฝึกงาน/สหกิจ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-secondary">⏰ ขั้นตอนการสมัคร</h4>
              <ul className="space-y-2 text-sm">
                <li>1. เลือกประเภทการฝึกงาน</li>
                <li>2. กรอกใบสมัครในระบบ</li>
                <li>3. อัพโหลดเอกสารประกอบ</li>
                <li>4. รอการอนุมัติจากอาจารย์</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}