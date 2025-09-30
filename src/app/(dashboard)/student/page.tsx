'use client';

import { useState } from 'react';
import { internships, applications, users, progressReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle, Clock, FileText, XCircle, BookOpen, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();
  const student = users.find(u => u.id === STUDENT_ID);
  
  // Use state to make applications data mutable
  const [myApplications, setMyApplications] = useState(applications.filter(app => app.studentId === STUDENT_ID));

  const approvedApplication = myApplications.find(app => app.status === 'approved');
  const approvedInternship = approvedApplication ? internships.find(i => i.id === approvedApplication.internshipId) : null;
  const myProgressReports = approvedApplication ? progressReports.filter(p => p.applicationId === approvedApplication.id) : [];

  const [projectTopic, setProjectTopic] = useState(approvedApplication?.projectTopic || '');
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);


  const statusTranslations: { [key: string]: string } = {
    approved: "อนุมัติ",
    pending: "รอการตรวจสอบ",
    rejected: "ปฏิเสธ",
  };

  const isCoop = approvedInternship?.type === 'co-op';

  const handleSaveProjectTopic = () => {
    if (!approvedApplication) return;
    
    // Simulate updating the data
    const appIndex = applications.findIndex(app => app.id === approvedApplication.id);
    if (appIndex !== -1) {
        applications[appIndex].projectTopic = projectTopic;
    }

    // Update local state to re-render
    setMyApplications(prevApps => 
        prevApps.map(app => 
            app.id === approvedApplication.id ? { ...app, projectTopic: projectTopic } : app
        )
    );
    
    toast({
        title: "บันทึกสำเร็จ",
        description: "หัวข้อโปรเจคของคุณได้รับการอัปเดตแล้ว",
    })
    setIsProjectDialogOpen(false);
  };


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
                 <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
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
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="mt-2">แก้ไขหัวข้อ</Button>
                                    </DialogTrigger>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-muted-foreground">คุณยังไม่ได้กำหนดหัวข้อโปรเจค</p>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="mt-2">กำหนดหัวข้อโปรเจค</Button>
                                    </DialogTrigger>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>แก้ไขหัวข้อโปรเจค</DialogTitle>
                            <DialogDescription>
                                กรอกหรือแก้ไขหัวข้อโปรเจคสหกิจศึกษาของคุณที่นี่
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="project-topic" className="text-right">
                                    หัวข้อ
                                </Label>
                                <Input
                                    id="project-topic"
                                    value={projectTopic}
                                    onChange={(e) => setProjectTopic(e.target.value)}
                                    className="col-span-3"
                                    placeholder="เช่น การพัฒนาระบบ AI..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSaveProjectTopic}>
                                <Save className="mr-2 h-4 w-4" />
                                บันทึก
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
