'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building, Calendar, Mail, Phone, GraduationCap, MapPin, Clock, Save, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ApplicationDetails {
  id: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  dateApplied: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    major?: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
    department?: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
    faculty?: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
  };
  internship: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    company: {
      id: string;
      name: string;
      nameEn?: string;
      address: string;
      phone?: string;
      email?: string;
      website?: string;
    };
  };
  courseInstructor?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isEducator } = useEducatorRole();
  const { toast } = useToast();
  
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | ''>('');
  const [feedback, setFeedback] = useState('');

  const applicationId = params.applicationId as string;

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await fetch(`/api/educator/applications/${applicationId}?userId=${user?.id}`);
      const data = await response.json();
      
      if (data.success && data.application) {
        setApplication(data.application);
        setApprovalStatus(data.application.status);
      } else {
        setError(true);
        setErrorMessage(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error('Error loading application:', err);
      setError(true);
      setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!approvalStatus) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาเลือกการอนุมัติ',
        variant: 'destructive'
      });
      return;
    }

    if (approvalStatus === 'rejected' && !feedback.trim()) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกเหตุผลในการปฏิเสธ',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/educator/applications/${applicationId}?userId=${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalStatus,
          feedback: feedback || null,
          isDraft
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: isDraft ? 'บันทึกแบบร่างแล้ว' : 
            approvalStatus === 'approved' ? 'อนุมัติใบสมัครแล้ว' : 'ปฏิเสธใบสมัครแล้ว',
        });
        
        if (!isDraft) {
          if (approvalStatus === 'approved') {
            router.push('/educator/assign-advisor');
          } else {
            router.push('/educator/coop-requests');
          }
        }
      } else {
        toast({
          title: 'ข้อผิดพลาด',
          description: data.error || 'ไม่สามารถบันทึกข้อมูลได้',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error updating application:', err);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || errorMessage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground">{errorMessage || 'ไม่สามารถโหลดข้อมูลได้'}</p>
          <Button asChild className="mt-4">
            <Link href="/educator/coop-requests">กลับไปหน้ารายการ</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูล</h2>
          <p className="text-muted-foreground">ไม่พบใบสมัครที่ต้องการ</p>
          <Button asChild className="mt-4">
            <Link href="/educator/coop-requests">กลับไปหน้ารายการ</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/educator/coop-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายละเอียดใบสมัคร</h1>
          <p className="text-muted-foreground">
            ตรวจสอบและอนุมัติใบสมัครฝึกงาน/สหกิจศึกษา
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* ข้อมูลนักศึกษา */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              ข้อมูลนักศึกษา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</Label>
                <p className="text-lg font-semibold">{application.student.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">รหัสนักศึกษา</Label>
                <p className="text-lg font-semibold">{application.studentId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">อีเมล</Label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {application.student.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</Label>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {application.student.phone || 'ไม่ระบุ'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">สาขาวิชา</Label>
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  {application.student.major?.nameTh || 'ไม่ระบุ'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">คณะ</Label>
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  {application.student.faculty?.nameTh || 'ไม่ระบุ'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลการฝึกงาน */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              ข้อมูลการฝึกงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">ตำแหน่งงาน</Label>
              <p className="font-semibold">{application.internship.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">บริษัท</Label>
              <p className="font-semibold">{application.internship.company.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ที่อยู่</Label>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                {application.internship.company.address}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ระยะเวลา</Label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(application.internship.startDate).toLocaleDateString('th-TH')} - {new Date(application.internship.endDate).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">วันที่สมัคร</Label>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {new Date(application.dateApplied).toLocaleDateString('th-TH')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* การอนุมัติ */}
      <Card>
        <CardHeader>
          <CardTitle>การอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">สถานะการอนุมัติ</Label>
            <RadioGroup
              value={approvalStatus}
              onValueChange={(value) => setApprovalStatus(value as 'approved' | 'rejected')}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="text-green-600 font-medium">
                  อนุมัติ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="text-red-600 font-medium">
                  ปฏิเสธ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {approvalStatus === 'rejected' && (
            <div>
              <Label htmlFor="feedback" className="text-base font-medium">
                เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธ..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting || !approvalStatus}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {approvalStatus === 'approved' ? 'อนุมัติและมอบหมายอาจารย์นิเทศ' : 
               approvalStatus === 'rejected' ? 'ปฏิเสธและส่งกลับ' : 'บันทึก'}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              บันทึกแบบร่าง
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
