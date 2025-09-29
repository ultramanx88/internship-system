import { notFound } from 'next/navigation';
import { applications, users, internships } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewTool } from '@/components/dashboard/teacher/ReviewTool';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function ApplicationReviewPage({ params }: { params: { applicationId: string } }) {
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

  return (
    <div className="space-y-8 text-secondary-600">
       <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/teacher">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปที่แดชบอร์ด
            </Link>
        </Button>
        <h1 className="text-3xl font-bold gradient-text">ตรวจสอบใบสมัคร</h1>
        <p>กำลังตรวจสอบใบสมัครจาก {student.name} สำหรับตำแหน่ง {internship.title}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                         <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} alt={student.name} />
                        <AvatarFallback className="text-xl">{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{student.name}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                       <h4 className="font-semibold">ทักษะ</h4>
                       <p className="text-sm text-muted-foreground">{student.skills}</p>
                   </div>
                    <div>
                       <h4 className="font-semibold">เรียงความส่วนตัว</h4>
                       <p className="text-sm text-muted-foreground">{student.statement}</p>
                   </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>รายละเอียดการฝึกงาน</CardTitle>
                    <CardDescription>{internship.title} ที่ {internship.company}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{internship.description}</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <ReviewTool student={student} internship={internship} application={application} />
        </div>
      </div>
    </div>
  );
}
