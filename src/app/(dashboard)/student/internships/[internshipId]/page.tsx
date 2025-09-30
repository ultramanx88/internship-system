'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { internships as mockInternships } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, MapPin, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InternshipDetailsPage() {
  const params = useParams();
  const internshipId = params.internshipId as string;
  const { toast } = useToast();

  const internship = mockInternships.find(i => i.id === internshipId);

  if (!internship) {
    notFound();
  }

  const handleApply = () => {
    // In a real app, this would trigger an API call to create an application.
    toast({
      title: 'ส่งใบสมัครแล้ว',
      description: `ใบสมัครของคุณสำหรับตำแหน่ง ${internship.title} ได้ถูกส่งเรียบร้อยแล้ว`,
    });
  };
  
  const typeTranslations: { [key: string]: string } = {
    'internship': 'ฝึกงาน',
    'co-op': 'สหกิจศึกษา'
  };

  return (
    <div className="space-y-8 text-secondary-600">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/student/internships">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้ารายการ
            </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold gradient-text">{internship.title}</h1>
                <p className="flex items-center gap-2 mt-1">
                    <Building className="h-5 w-5 text-primary" />
                    <span className="text-xl">{internship.company}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {internship.location}
                </p>
            </div>
             <Badge variant={internship.type === 'co-op' ? 'default' : 'secondary'} className="text-base">
                {typeTranslations[internship.type]}
            </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>รายละเอียดตำแหน่งงาน</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="whitespace-pre-wrap">{internship.description}</p>
        </CardContent>
        <CardFooter>
            <Button size="lg" className="w-full sm:w-auto" onClick={handleApply}>
                <Briefcase className="mr-2 h-4 w-4"/>
                สมัครงานนี้
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
