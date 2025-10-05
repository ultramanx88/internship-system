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
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { useAuth } from '@/hooks/use-auth';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building, Calendar, Mail, Phone, GraduationCap, MapPin, Clock, Save, Send } from 'lucide-react';
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
    major: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
    department: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
    faculty: {
      id: string;
      nameTh: string;
      nameEn: string;
    };
  };
  internship: {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    startDate: string;
    endDate: string;
    company: {
      id: string;
      name: string;
      nameEn: string;
      address: string;
      registrationNumber: string;
      phone: string;
      email: string;
      website: string;
    };
  };
  courseInstructor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { educatorRole, isLoading, error } = useEducatorRole();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State สำหรับการอนุมัติ/ไม่อนุมัติ
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const applicationId = params.applicationId as string;

  useEffect(() => {
    if (applicationId && !isLoading) {
      loadApplication();
    }
  }, [applicationId, isLoading]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (!user?.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      const response = await fetch(`/api/educator/applications/${applicationId}?userId=${user.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ไม่พบใบสมัครที่ต้องการ');
        }
        if (response.status === 403) {
          throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
        }
        throw new Error('ไม่สามารถดึงข้อมูลได้');
      }

      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      console.error('Error loading application:', err);
      setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">รอผล</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">อนุมัติ</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">ไม่อนุมัติ</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบ</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!approvalStatus) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเลือกการอนุมัติหรือไม่อนุมัติ',
        variant: 'destructive'
      });
      return;
    }

    if (approvalStatus === 'rejected' && !feedback.trim()) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาระบุเหตุผลการไม่อนุมัติ',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
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
        if (isDraft) {
          toast({
            title: 'สำเร็จ',
            description: 'บันทึกแบบร่างแล้ว',
          });
        } else if (approvalStatus === 'approved') {
          toast({
            title: 'สำเร็จ',
            description: 'อนุมัติแล้ว กำลังไปหน้ามอบหมายอาจารย์ที่ปรึกษา',
          });
          // ไปหน้ามอบหมายอาจารย์ที่ปรึกษา
          router.push('/educator/assign-advisor');
        } else {
          toast({
            title: 'สำเร็จ',
            description: 'ไม่อนุมัติและส่งแล้ว นักศึกษาจะไม่เห็นข้อมูลนี้',
          });
          // กลับไปหน้ารายการ
          router.push('/educator/coop-requests');
        }
        
        if (!isDraft) {
          // อัปเดตสถานะในหน้า
          setApplication(prev => prev ? { ...prev, status: approvalStatus } : null);
        }
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถบันทึกได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // แสดง loading state
  if (isLoading || loading) {
    return (
      <SidebarProvider>
        <Sidebar>
          <EducatorMenu
            userRole={user?.roles?.[0] || 'courseInstructor'}
            educatorRole={educatorRole?.name}
          />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลด...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // แสดง error state
  if (error || errorMessage) {
    return (
      <SidebarProvider>
        <Sidebar>
          <EducatorMenu
            userRole={user?.roles?.[0] || 'courseInstructor'}
            educatorRole={educatorRole?.name}
          />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 text-destructive mx-auto mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-muted-foreground">{error || errorMessage}</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!application) {
    return (
      <SidebarProvider>
        <Sidebar>
          <EducatorMenu
            userRole={user?.roles?.[0] || 'courseInstructor'}
            educatorRole={educatorRole?.name}
          />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 text-destructive mx-auto mb-4">📄</div>
              <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูล</h2>
              <p className="text-muted-foreground">ไม่พบข้อมูลใบสมัครที่ต้องการ</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <EducatorMenu
          userRole={user?.roles?.[0] || 'courseInstructor'}
          educatorRole={educatorRole?.name}
        />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <div className="min-h-screen bg-gray-50 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/educator/coop-requests">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-amber-700">รายละเอียดการขอฝึกงาน</h1>
                <p className="text-gray-600">ข้อมูลการขอฝึกงานของนักศึกษา</p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="max-w-6xl mx-auto mb-4">
            <p className="text-amber-700 text-sm">
              รายการขอฝึกงาน &gt; รายละเอียดการขอฝึกงาน
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-6">
            {/* ข้อมูลส่วนตัว */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลส่วนตัว</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-amber-700 font-medium">ชื่อจริง-นามสกุล (Full-name) : </span>
                    <span className="text-gray-900">{application.student.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">รหัสนักศึกษา (Student ID) : </span>
                    <span className="text-gray-900">{application.student.id}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ประเภท (Type) : </span>
                    <span className="text-gray-900">{application.internship.type}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ชื่อบริษัท (Company) : </span>
                    <span className="text-gray-900">{application.internship.company.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">เลขทะเบียนบริษัท (Registration no.) : </span>
                    <span className="text-gray-900">{application.internship.company.registrationNumber || 'ไม่ระบุ'}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">แผนก (Department) : </span>
                    <span className="text-gray-900">{application.student.department?.nameTh || 'ไม่ระบุ'}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ตำแหน่ง (Position) : </span>
                    <span className="text-gray-900">{application.internship.title}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ระยะเวลา (Duration) : </span>
                    <span className="text-gray-900">
                      {formatDate(application.internship.startDate)} - {formatDate(application.internship.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">อาจารย์นิเทศ (Academic advisor) : </span>
                    <span className="text-gray-900">{application.courseInstructor.name}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-amber-700 font-medium">ที่อยู่บริษัท (Address) : </span>
                    <span className="text-gray-900">{application.internship.company.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลการติดต่อ */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลการติดต่อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 font-medium">อีเมลนักศึกษา: </span>
                    <span className="text-gray-900">{application.student.email}</span>
                  </div>
                  {application.student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-700 font-medium">โทรศัพท์: </span>
                      <span className="text-gray-900">{application.student.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 font-medium">อีเมลบริษัท: </span>
                    <span className="text-gray-900">{application.internship.company.email || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 font-medium">โทรศัพท์บริษัท: </span>
                    <span className="text-gray-900">{application.internship.company.phone || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* รายละเอียดการฝึกงาน */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-700">รายละเอียดการฝึกงาน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-amber-700 font-medium">หัวข้อการฝึกงาน: </span>
                    <span className="text-gray-900">{application.internship.title}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">คำอธิบาย: </span>
                    <p className="text-gray-900 mt-1">{application.internship.description}</p>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">สถานที่ฝึกงาน: </span>
                    <span className="text-gray-900">{application.internship.location}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">สถานะ: </span>
                    <span className="ml-2">{getStatusBadge(application.status)}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">วันที่ยื่นคำขอ: </span>
                    <span className="text-gray-900">{formatDate(application.dateApplied)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลสถาบัน */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลสถาบัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-amber-700 font-medium">คณะ: </span>
                    <span className="text-gray-900">{application.student.faculty?.nameTh || 'ไม่ระบุ'}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">สาขาวิชา: </span>
                    <span className="text-gray-900">{application.student.major?.nameTh || 'ไม่ระบุ'}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ภาควิชา: </span>
                    <span className="text-gray-900">{application.student.department?.nameTh || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ส่วนอนุมัติ/ไม่อนุมัติ */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-700">อาจารย์ประจำวิชารับรอง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Radio Buttons สำหรับการอนุมัติ/ไม่อนุมัติ */}
                <div className="space-y-4">
                  <RadioGroup value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as 'approved' | 'rejected' | '')}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="approved" id="approved" className="text-amber-600" />
                      <Label htmlFor="approved" className="text-gray-700 cursor-pointer text-base">
                        อนุมัติ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="rejected" id="rejected" className="text-amber-600" />
                      <Label htmlFor="rejected" className="text-gray-700 cursor-pointer text-base">
                        ไม่อนุมัติ
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Textarea สำหรับเหตุผลการไม่อนุมัติ */}
                {approvalStatus === 'rejected' && (
                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="text-amber-700 font-medium text-base">
                      ข้อเสนอแนะเพิ่มเติม
                    </Label>
                    <Textarea
                      id="feedback"
                      placeholder="พิมพ์ข้อความ"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                  </div>
                )}

                {/* ปุ่มบันทึก */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || !approvalStatus || (approvalStatus === 'rejected' && !feedback.trim())}
                    className="bg-amber-600 hover:bg-amber-700 text-white h-12"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {approvalStatus === 'approved' ? 'บันทึกและมอบหมายอาจารย์ที่ปรึกษา' : 'บันทึกและส่ง'}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={submitting || !approvalStatus}
                    variant="outline"
                    className="h-12 border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    บันทึกแบบร่าง
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" asChild>
                <Link href="/educator/coop-requests">
                  กลับไปรายการ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
