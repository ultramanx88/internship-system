'use client';

import { internships, applications, users, progressReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle, Clock, FileText, XCircle, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// For demo purposes, we'll hardcode the student user
const STUDENT_ID = 'test001';

const statusIcons: { [key: string]: React.ReactNode } = {
  approved: <CheckCircle className="text-white" />,
  pending: <Clock className="text-secondary-foreground" />,
  rejected: <XCircle className="text-white" />,
};

const statusColors: { [key: string]: string } = {
    approved: "bg-[#2f7b69] text-white",
    pending: "bg-[#f4a79d] text-secondary-foreground",
    rejected: "bg-[#a01f38] text-white",
};


export default function StudentPage() {
  const student = users.find(u => u.id === STUDENT_ID);
  const myApplications = applications.filter(app => app.studentId === STUDENT_ID);
  const approvedApplication = myApplications.find(app => app.status === 'approved');
  const approvedInternship = approvedApplication ? internships.find(i => i.id === approvedApplication.internshipId) : null;
  const myProgressReports = approvedApplication ? progressReports.filter(p => p.applicationId === approvedApplication.id) : [];

  const statusTranslations: { [key: string]: string } = {
    approved: "อนุมัติ",
    pending: "รอการตรวจสอบ",
    rejected: "ปฏิเสธ",
  };

  const isCoop = approvedInternship?.type === 'co-op';

  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ยินดีต้อนรับ, {student?.name}!</h1>
        <p>นี่คือสิ่งที่เกิดขึ้นกับการเดินทางฝึกงานของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>ใบสมัครของฉัน</CardTitle>
                    <CardDescription>ติดตามสถานะใบสมัครที่คุณส่งไป</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {myApplications.map(app => {
                            const internship = internships.find(i => i.id === app.internshipId);
                            return (
                                <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <h3 className="font-semibold">{internship?.title}</h3>
                                        <p className="text-sm text-muted-foreground">{internship?.company}</p>
                                    </div>
                                    <Badge className={`capitalize ${statusColors[app.status]}`}>
                                        {statusIcons[app.status]}
                                        <span className="ml-2">{statusTranslations[app.status]}</span>
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {isCoop && (
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <BookOpen />
                           ข้อมูลโปรเจค (สหกิจศึกษา)
                        </CardTitle>
                        <CardDescription>จัดการหัวข้อและรายละเอียดโปรเจคสหกิจของคุณ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {approvedApplication?.projectTopic ? (
                            <div>
                                <p className="font-semibold">หัวข้อโปรเจค:</p>
                                <p className="text-muted-foreground">{approvedApplication.projectTopic}</p>
                                <Button variant="outline" size="sm" className="mt-2">แก้ไขหัวข้อ</Button>
                            </div>
                        ) : (
                             <div>
                                <p className="text-muted-foreground">คุณยังไม่ได้กำหนดหัวข้อโปรเจค</p>
                                <Button size="sm" className="mt-2">กำหนดหัวข้อโปรเจค</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {approvedApplication && (
                <Card>
                    <CardHeader>
                        <CardTitle>ความคืบหน้าการฝึกงาน</CardTitle>
                        <CardDescription>บันทึกความคืบหน้าการฝึกงานของคุณที่ {approvedInternship?.company}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <form className="space-y-4">
                           <Textarea placeholder="เขียนรายงานความคืบหน้าประจำสัปดาห์ของคุณ..." />
                           <Button>ส่งรายงาน</Button>
                       </form>
                       <Separator />
                       <h4 className="font-semibold text-lg">รายงานที่ส่งแล้ว</h4>
                       <div className="space-y-4 max-h-60 overflow-y-auto">
                        {myProgressReports.length > 0 ? myProgressReports.map(report => (
                            <div key={report.id} className="p-4 bg-muted rounded-lg">
                                <p className="text-sm">{report.report}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(report.date).toLocaleDateString()}</p>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">ยังไม่มีการส่งรายงาน</p>}
                       </div>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>การฝึกงานที่เปิดรับ</CardTitle>
                    <CardDescription>สำรวจและสมัครโอกาสใหม่ๆ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {internships.map(internship => (
                            <div key={internship.id} className="rounded-lg border p-4">
                                <h3 className="font-semibold">{internship.title}</h3>
                                <p className="text-sm text-muted-foreground">{internship.company}</p>
                                <p className="text-sm mt-2 line-clamp-2">{internship.description}</p>
                                <Button size="sm" variant="outline" className="mt-3">ดูและสมัคร</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
