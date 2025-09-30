'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { applications, users, internships, progressReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Building, Calendar, FileText, Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ReportDetailsPage() {
  const pathname = usePathname();
  const reportId = pathname.split('/').pop();
  
  const application = applications.find(app => app.id === reportId);

  const student = users.find(u => u.id === application?.studentId);
  const internship = internships.find(i => i.id === application?.internshipId);
  const teacher = users.find(u => u.roles.includes('visitor')); // Mock data

  if (!application || !student || !internship) {
    return (
        <div className="space-y-8 p-4 text-secondary-600">
             <Button asChild variant="outline" size="sm" className="mb-4">
              <Link href="/admin/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้ารายงาน
              </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>ไม่พบข้อมูล</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>ไม่สามารถโหลดรายละเอียดรายงานได้ กรุณาตรวจสอบว่า URL ถูกต้องหรือไม่</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8 text-secondary-600">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/admin/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้ารายงาน
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">รายงานผลการนิเทศ</h1>
            <p>สำหรับ: {student.name}</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            พิมพ์รายงาน
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User />ข้อมูลนักศึกษา</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>ชื่อ:</strong> {student.name}</p>
                    <p><strong>รหัสนักศึกษา:</strong> {student.id}</p>
                    <p><strong>อีเมล:</strong> {student.email}</p>
                    <p><strong>สาขาวิชา:</strong> เทคโนโลยีสารสนเทศ</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building />ข้อมูลสถานประกอบการ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>บริษัท:</strong> {internship.company}</p>
                    <p><strong>ตำแหน่ง:</strong> {internship.title}</p>
                    <p><strong>ที่ตั้ง:</strong> {internship.location}</p>
                    <p><strong>ประเภท:</strong> {internship.type === 'co_op' ? 'สหกิจศึกษา' : 'ฝึกงาน'}</p>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText />บันทึกการนิเทศ</CardTitle>
                    <CardDescription>
                        โดย อ.{teacher?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* This would be populated with actual visit data */}
                    <div className="space-y-4">
                        <div className="font-semibold flex items-center gap-2"><Calendar /> การนิเทศครั้งที่ 1</div>
                        <p className="text-sm text-muted-foreground">วันที่: 15 มิถุนายน 2567</p>
                        <p className="text-sm pl-4 border-l-2 ml-2">นักศึกษามีความกระตือรือร้นในการเรียนรู้และสามารถปรับตัวเข้ากับสภาพแวดล้อมการทำงานได้ดี ได้รับมอบหมายให้ช่วยพัฒนา UI ของแอปพลิเคชันส่วนลูกค้า พบปัญหาเล็กน้อยในการใช้ Git แต่ได้รับการช่วยเหลือจากพี่เลี้ยงแล้ว</p>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <div className="font-semibold flex items-center gap-2"><Calendar /> การนิเทศครั้งที่ 2</div>
                        <p className="text-sm text-muted-foreground">วันที่: 20 กรกฎาคม 2567</p>
                        <p className="text-sm pl-4 border-l-2 ml-2">นักศึกษามีความก้าวหน้าอย่างเห็นได้ชัด สามารถทำงานที่ได้รับมอบหมายได้เสร็จสิ้นตามกำหนดและมีคุณภาพดี เริ่มมีส่วนร่วมในการประชุมทีมและนำเสนอแนวคิดใหม่ๆ ได้รับคำชมจากหัวหน้างานในเรื่องความรับผิดชอบ</p>
                    </div>

                    <Separator />

                     <div className="space-y-2">
                        <h4 className="font-semibold">สรุปผลและข้อเสนอแนะ</h4>
                        <p className="text-sm">โดยรวมแล้วนักศึกษามีผลการปฏิบัติงานที่ดีมาก มีศักยภาพในการพัฒนาไปเป็นนักพัฒนาที่ดีในอนาคต ควรฝึกฝนทักษะการสื่อสารและการนำเสนอเพิ่มเติมเพื่อความก้าวหน้าในสายอาชีพ</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
