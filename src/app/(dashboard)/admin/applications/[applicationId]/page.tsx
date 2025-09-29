
import { notFound } from 'next/navigation';
import { applications, users, internships } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, GraduationCap, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function ApplicationDetailsPage({ params }: { params: { applicationId: string } }) {
  const { applicationId } = params;
  const application = applications.find(app => app.id === applicationId);

  if (!application) {
    notFound();
  }

  const student = users.find(u => u.id === application.studentId);
  const internship = internships.find(i => i.id === application.internshipId);

  if (!student || !internship) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const statusColors: { [key: string]: string } = {
    approved: "bg-[#2f7b69] text-white",
    pending: "bg-[#f4a79d] text-secondary-foreground",
    rejected: "bg-[#a01f38] text-white",
  };

  const statusTranslations: { [key: string]: string } = {
    approved: "อนุมัติ",
    pending: "รอการตรวจสอบ",
    rejected: "ปฏิเสธ",
  };

  return (
    <div className="space-y-8 text-secondary-600">
       <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin/applications">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้ารายการ
            </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">รายละเอียดใบสมัคร</h1>
            <p>ใบสมัครจาก {student.name} สำหรับตำแหน่ง {internship.title}</p>
          </div>
          <Badge className={`text-base ${statusColors[application.status]}`}>
            สถานะ: {statusTranslations[application.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลนักศึกษา</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                         <Avatar className="h-20 w-20 border">
                            <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} alt={student.name} />
                            <AvatarFallback className="text-2xl">{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-semibold">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">รหัสนักศึกษา: {student.id}</p>
                        </div>
                    </div>
                   <div className="space-y-2 text-sm">
                       <p className="flex items-center gap-2"><Mail /> {student.email}</p>
                       <p className="flex items-center gap-2"><Phone /> (ยังไม่มีข้อมูล)</p>
                       <p className="flex items-center gap-2"><GraduationCap /> เทคโนโลยีสารสนเทศ</p>
                   </div>
                   <div className="space-y-2 pt-2">
                       <h4 className="font-semibold">ทักษะ</h4>
                       <p className="text-sm text-muted-foreground">{student.skills}</p>
                   </div>
                    <div className="space-y-2">
                       <h4 className="font-semibold">เรียงความส่วนตัว</h4>
                       <p className="text-sm text-muted-foreground whitespace-pre-wrap">{student.statement}</p>
                   </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลการฝึกงาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between">
                         <div>
                            <h3 className="text-xl font-semibold">{internship.title}</h3>
                            <p className="text-muted-foreground">{internship.company}</p>
                        </div>
                        <Badge variant={internship.type === 'co-op' ? 'default' : 'secondary'}>{internship.type === 'co-op' ? 'สหกิจศึกษา' : 'ฝึกงาน'}</Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">ที่ตั้ง</p>
                        <p className="text-sm text-muted-foreground">{internship.location}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-medium">รายละเอียดงาน</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{internship.description}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>เอกสารแนบ</CardTitle>
                </CardHeader>
                 <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4"/>
                            <a href="#" className="text-primary hover:underline">Resume_{student.name.replace(' ','_')}.pdf</a>
                        </li>
                         <li className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4"/>
                            <a href="#" className="text-primary hover:underline">Transcript_{student.id}.pdf</a>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

