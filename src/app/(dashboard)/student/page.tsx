import { internships, applications, users, progressReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// For demo purposes, we'll hardcode the student user
const STUDENT_ID = 'test001';

const statusIcons: { [key: string]: React.ReactNode } = {
  approved: <CheckCircle className="text-green-500" />,
  pending: <Clock className="text-yellow-500" />,
  rejected: <XCircle className="text-red-500" />,
};

const statusColors: { [key: string]: string } = {
    approved: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};


export default function StudentPage() {
  const student = users.find(u => u.id === STUDENT_ID);
  const myApplications = applications.filter(app => app.studentId === STUDENT_ID);
  const approvedApplication = myApplications.find(app => app.status === 'approved');
  const myProgressReports = approvedApplication ? progressReports.filter(p => p.applicationId === approvedApplication.id) : [];

  const statusTranslations: { [key: string]: string } = {
    approved: "อนุมัติ",
    pending: "รอการตรวจสอบ",
    rejected: "ปฏิเสธ",
  };

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold">ยินดีต้อนรับ, {student?.name}!</h1>
        <p className="text-muted-foreground">นี่คือสิ่งที่เกิดขึ้นกับการเดินทางฝึกงานของคุณ</p>
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
                                    <Badge variant="outline" className={`capitalize ${statusColors[app.status]}`}>
                                        {statusIcons[app.status]}
                                        <span className="ml-2">{statusTranslations[app.status]}</span>
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {approvedApplication && (
                <Card>
                    <CardHeader>
                        <CardTitle>ความคืบหน้าการฝึกงาน</CardTitle>
                        <CardDescription>บันทึกความคืบหน้าการฝึกงานของคุณที่ {internships.find(i => i.id === approvedApplication.internshipId)?.company}</CardDescription>
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
