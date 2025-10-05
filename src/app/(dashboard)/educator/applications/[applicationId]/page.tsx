'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, GraduationCap, Building, Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
// import { ReviewTool } from '@/components/dashboard/teacher/ReviewTool';

interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    phone?: string;
    skills?: string;
    statement?: string;
    profileImage?: string;
  };
  internship: {
    id: string;
    title: string;
    description: string;
    company: {
      id: string;
      name: string;
      address?: string;
    };
  };
}

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, educatorRole, isLoading } = useEducatorRole();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applicationId = params.applicationId as string;

  useEffect(() => {
    if (applicationId && !isLoading) {
      loadApplication();
    }
  }, [applicationId, isLoading]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/educator/applications/${applicationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ไม่พบใบสมัครที่ต้องการ');
        }
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      console.error('Error loading application:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">รอการตรวจสอบ</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            ไม่พบข้อมูลใบสมัคร
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/educator/applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปที่รายการใบสมัคร
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">ตรวจสอบใบสมัคร</h1>
        <p className="text-gray-600 mt-1">
          กำลังตรวจสอบใบสมัครจาก {application.student.name} สำหรับตำแหน่ง {application.internship.title}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Student Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage 
                  src={application.student.profileImage || `https://avatar.vercel.sh/${application.student.email}.png`} 
                  alt={application.student.name} 
                />
                <AvatarFallback className="text-xl">
                  {getInitials(application.student.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{application.student.name}</CardTitle>
                <CardDescription>{application.student.email}</CardDescription>
                <div className="mt-2">
                  {getStatusBadge(application.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">รหัสนักศึกษา:</span>
                <span className="text-sm">{application.student.studentId}</span>
              </div>
              
              {application.student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">โทรศัพท์:</span>
                  <span className="text-sm">{application.student.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">วันที่สมัคร:</span>
                <span className="text-sm">
                  {new Date(application.createdAt).toLocaleDateString('th-TH')}
                </span>
              </div>

              {application.student.skills && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">ทักษะ</h4>
                  <p className="text-sm text-gray-600">{application.student.skills}</p>
                </div>
              )}

              {application.student.statement && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">เรียงความส่วนตัว</h4>
                  <p className="text-sm text-gray-600">{application.student.statement}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internship Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                รายละเอียดการฝึกงาน
              </CardTitle>
              <CardDescription>
                {application.internship.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">บริษัท:</span>
                <span className="text-sm">{application.internship.company.name}</span>
              </div>

              {application.internship.company.address && (
                <div>
                  <span className="text-sm font-medium">ที่อยู่:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.internship.company.address}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium">คำอธิบาย:</span>
                <p className="text-sm text-gray-600 mt-1">
                  {application.internship.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Tool - Temporarily disabled */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>เครื่องมือตรวจสอบ</CardTitle>
              <CardDescription>เครื่องมือตรวจสอบใบสมัคร (กำลังพัฒนา)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">เครื่องมือตรวจสอบใบสมัครจะเปิดใช้งานในเร็วๆ นี้</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
