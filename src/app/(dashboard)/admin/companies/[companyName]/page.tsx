import { notFound } from 'next/navigation';
import Link from 'next/link';
import { internships, applications, users } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, MapPin, Briefcase, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function CompanyDetailsPage({ params }: { params: { companyName: string } }) {
  const companyName = decodeURIComponent(params.companyName);
  
  const companyInternships = internships.filter(i => i.company === companyName);

  if (companyInternships.length === 0) {
    notFound();
  }

  const companyLocation = companyInternships[0].location;

  const studentApplications = applications.filter(app => 
    companyInternships.some(i => i.id === app.internshipId) && app.status === 'approved'
  );

  const students = studentApplications.map(app => {
    const studentUser = users.find(u => u.id === app.studentId);
    const internship = companyInternships.find(i => i.id === app.internshipId);
    return {
      ...studentUser,
      internshipTitle: internship?.title || 'N/A'
    }
  });

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="space-y-8 text-secondary-600">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/admin/companies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้ารายชื่อบริษัท
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Building className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">{companyName}</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {companyLocation}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase />ตำแหน่งงานที่เปิดรับ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {companyInternships.map(internship => (
                <li key={internship.id} className="rounded-md border p-4">
                  <h3 className="font-semibold">{internship.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{internship.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User />นักศึกษาที่ฝึกงาน</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <ul className="space-y-4">
                {students.map(student => (
                  <li key={student.id} className="flex items-center gap-4 rounded-md border p-3">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${student.email}.png`} alt={student.name} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.internshipTitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                ยังไม่มีนักศึกษาที่ได้รับการอนุมัติให้ฝึกงานในบริษัทนี้
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
