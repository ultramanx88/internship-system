'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, MapPin, Briefcase, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const internshipId = params?.internshipId as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<any | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงประกาศฝึกงานจริง
        const res = await fetch(`/api/internships/${encodeURIComponent(internshipId)}`);
        const js = await res.json();
        if (!res.ok || !js.success) {
          notFound();
          return;
        }
        setInternship(js.internship);

        // ดึงคำขอของนักศึกษาคนนี้เพื่อเช็คสถานะ
        if (user?.id) {
          const appsRes = await fetch(`/api/applications?studentId=${encodeURIComponent(user.id)}`);
          const apps = await appsRes.json();
          if (apps.success && Array.isArray(apps.applications)) {
            const existing = apps.applications.find((app: any) => app.internshipId === internshipId);
            if (existing) {
              setHasApplied(true);
              setApplicationStatus(existing.status || 'pending');
            }
          }
        }
      } catch (e) {
        console.error(e);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [internshipId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!internship) {
    notFound();
  }

  const handleApply = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเข้าสู่ระบบก่อนสมัครฝึกงาน',
      });
      return;
    }

    // ไปยังฟอร์มจริง และส่ง internshipId ที่เลือกไปด้วย
    router.push(`/student/application-form/${internship.type}?internshipId=${internshipId}`);
  };
  
  const typeTranslations: { [key: string]: string } = {
    'internship': 'ฝึกงาน',
    'co_op': 'สหกิจศึกษา'
  };

  const statusTranslations: { [key: string]: string } = {
    'pending': 'รอการตรวจสอบ',
    'approved': 'อนุมัติแล้ว',
    'rejected': 'ปฏิเสธ'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
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
                    <span className="text-xl">Company ID: {internship.companyId}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {internship.location}
                </p>
            </div>
             <Badge variant={internship.type === 'co_op' ? 'default' : 'secondary'} className="text-base">
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
        <CardFooter className="flex flex-col gap-4">
            {hasApplied && applicationStatus ? (
              <div className="w-full">
                <Badge className={`${getStatusColor(applicationStatus)} mb-2`}>
                  <CheckCircle className="mr-2 h-4 w-4"/>
                  {statusTranslations[applicationStatus]}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  คุณได้สมัครตำแหน่งนี้แล้ว สถานะปัจจุบัน: {statusTranslations[applicationStatus]}
                </p>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="w-full sm:w-auto" 
                onClick={handleApply}
              >
                <Briefcase className="mr-2 h-4 w-4"/>
                สมัครงานนี้
              </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
