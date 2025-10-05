'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { useAuth } from '@/hooks/use-auth';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building, Calendar, Mail, Phone, GraduationCap, MapPin, Clock, Save, Send, Users } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  studentId: string;
  status: string;
  dateApplied: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    major?: {
      id: string;
      nameTh: string;
      nameEn: string;
    } | null;
    department?: {
      id: string;
      nameTh: string;
      nameEn: string;
    } | null;
    faculty?: {
      id: string;
      nameTh: string;
      nameEn: string;
    } | null;
  };
  internship: {
    id: string;
    title: string;
    companyId: string;
    location: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    company: {
      id: string;
      name: string;
      nameEn: string;
      address: string;
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

interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
}

export default function AssignSupervisorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isEducator } = useEducatorRole();
  const { toast } = useToast();
  
  const applicationId = params.applicationId as string;
  const [application, setApplication] = useState<Application | null>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadApplication();
      loadSupervisors();
    }
  }, [user?.id, applicationId]);

  const loadApplication = async () => {
    try {
      const response = await fetch(`/api/educator/applications/${applicationId}?userId=${user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setApplication(data.application);
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถโหลดข้อมูลได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading application:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSupervisors = async () => {
    try {
      const response = await fetch('/api/educator/supervisors');
      const data = await response.json();
      
      if (data.success) {
        setSupervisors(data.supervisors || []);
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedSupervisor) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเลือกอาจารย์นิเทศ',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/educator/applications/${applicationId}/assign-supervisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorId: selectedSupervisor,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: 'มอบหมายอาจารย์นิเทศแล้ว',
        });
        router.push('/educator/coop-requests');
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถมอบหมายได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error assigning supervisor:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถมอบหมายได้',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <Sidebar>
          <EducatorMenu />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลด...</p>
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
          <EducatorMenu />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">ไม่พบข้อมูลการฝึกงาน</p>
              <Button asChild className="mt-4">
                <Link href="/educator/coop-requests">กลับไปรายการ</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <EducatorMenu />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/educator/coop-requests">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">มอบหมายอาจารย์นิเทศ</h1>
                <p className="text-gray-600">เลือกอาจารย์นิเทศสำหรับการฝึกงาน</p>
              </div>
            </div>

            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  ข้อมูลการฝึกงาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-amber-700 font-medium">นักศึกษา: </span>
                    <span className="text-gray-900">{application.student.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ตำแหน่ง: </span>
                    <span className="text-gray-900">{application.internship.title}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">บริษัท: </span>
                    <span className="text-gray-900">{application.internship.company.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">ระยะเวลา: </span>
                    <span className="text-gray-900">
                      {formatDate(application.internship.startDate)} - {formatDate(application.internship.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  เลือกอาจารย์นิเทศ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supervisor">อาจารย์นิเทศ</Label>
                    <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกอาจารย์นิเทศ" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name} - {supervisor.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSupervisor && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2">ข้อมูลอาจารย์นิเทศ</h4>
                      {(() => {
                        const supervisor = supervisors.find(s => s.id === selectedSupervisor);
                        return supervisor ? (
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">ชื่อ:</span> {supervisor.name}</p>
                            <p><span className="font-medium">อีเมล:</span> {supervisor.email}</p>
                            <p><span className="font-medium">โทรศัพท์:</span> {supervisor.phone}</p>
                            <p><span className="font-medium">ภาควิชา:</span> {supervisor.department}</p>
                            <p><span className="font-medium">คณะ:</span> {supervisor.faculty}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" asChild>
                <Link href="/educator/coop-requests">
                  ยกเลิก
                </Link>
              </Button>
              <Button
                onClick={handleAssign}
                disabled={submitting || !selectedSupervisor}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'กำลังมอบหมาย...' : 'มอบหมายอาจารย์นิเทศ'}
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
