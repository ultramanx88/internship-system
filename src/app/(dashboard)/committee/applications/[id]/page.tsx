'use client';

import { useState, useEffect } from 'react';
import { CommitteeMenu } from '@/components/committee/CommitteeMenu';
import { CommitteeGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Calendar,
  User,
  Building,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
// import { toast } from 'sonner';

interface ApplicationData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentYear: number;
  major: string;
  gpa: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  position: string;
  internshipType: 'internship' | 'co_op';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  approvedByInstructor: boolean;
  instructorName: string;
  instructorApprovedAt: string;
  location: string;
  duration: string;
  startDate: string;
  endDate: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  latitude?: number;
  longitude?: number;
}

export default function CommitteeApplicationDetailsPage({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data - ในระบบจริงจะดึงจาก API
  useEffect(() => {
    const mockApplication: ApplicationData = {
      id: params.id,
      studentId: 's6800001',
      studentName: 'นาย สมชาย ใจดี',
      studentEmail: 'somchai@example.com',
      studentPhone: '081-234-5678',
      studentYear: 4,
      major: 'วิศวกรรมคอมพิวเตอร์',
      gpa: '3.45',
      companyName: 'บริษัท ABC จำกัด',
      companyAddress: '123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110',
      companyPhone: '02-123-4567',
      position: 'นักพัฒนาซอฟต์แวร์',
      internshipType: 'internship',
      status: 'pending',
      appliedAt: '2024-01-15',
      approvedByInstructor: true,
      instructorName: 'อาจารย์ ดร.สมชาย ใจดี',
      instructorApprovedAt: '2024-01-20',
      location: 'กรุงเทพมหานคร',
      duration: '4 เดือน',
      startDate: '2024-06-01',
      endDate: '2024-09-30',
      salary: '15,000 บาท/เดือน',
      description: 'การฝึกงานในตำแหน่งนักพัฒนาซอฟต์แวร์ โดยจะได้เรียนรู้การพัฒนาเว็บแอปพลิเคชันด้วยเทคโนโลยีสมัยใหม่',
      requirements: [
        'มีความรู้พื้นฐานในการเขียนโปรแกรม',
        'มีความรู้ด้าน HTML, CSS, JavaScript',
        'สามารถทำงานเป็นทีมได้',
        'มีความรับผิดชอบและตรงต่อเวลา'
      ],
      benefits: [
        'ได้รับประสบการณ์การทำงานจริง',
        'เรียนรู้เทคโนโลยีใหม่ๆ',
        'มีโอกาสได้งานประจำหลังจบการศึกษา',
        'ได้รับค่าตอบแทน'
      ],
      latitude: 13.7563,
      longitude: 100.5018
    };

    setTimeout(() => {
      setApplication(mockApplication);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      // API call to approve application
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('อนุมัติคำขอเรียบร้อยแล้ว');
      // Update status
      if (application) {
        setApplication({ ...application, status: 'approved' });
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      // API call to reject application
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
      // Update status
      if (application) {
        setApplication({ ...application, status: 'rejected' });
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />รอการพิจารณา</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ปฏิเสธ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'internship' 
      ? <Badge variant="outline" className="text-blue-600 border-blue-200">สหกิจศึกษา</Badge>
      : <Badge variant="outline" className="text-green-600 border-green-200">สหกิจศึกษา</Badge>;
  };

  if (loading) {
    return (
      <CommitteeGuard>
        <div className="flex h-screen bg-gray-100">
          <CommitteeMenu />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </CommitteeGuard>
    );
  }

  if (!application) {
    return (
      <CommitteeGuard>
        <div className="flex h-screen bg-gray-100">
          <CommitteeMenu />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
              <p className="text-gray-600">ไม่พบคำขอที่ระบุ</p>
            </div>
          </div>
        </div>
      </CommitteeGuard>
    );
  }

  return (
    <CommitteeGuard>
      <div className="flex h-screen bg-gray-100">
        <CommitteeMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/committee/applications">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับ
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอสหกิจศึกษา</h1>
                <p className="text-gray-600">ID: {application.id}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="request">คำขอ</TabsTrigger>
                <TabsTrigger value="student">นักศึกษา</TabsTrigger>
                <TabsTrigger value="company">บริษัท</TabsTrigger>
                <TabsTrigger value="timeline">ไทม์ไลน์</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      ข้อมูลคำขอ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ประเภท</p>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(application.internshipType)}
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ตำแหน่ง</p>
                        <p className="font-medium">{application.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ระยะเวลา</p>
                        <p className="font-medium">{application.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ค่าตอบแทน</p>
                        <p className="font-medium">{application.salary}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">วันที่เริ่ม</p>
                        <p className="font-medium">{new Date(application.startDate).toLocaleDateString('th-TH')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">วันที่สิ้นสุด</p>
                        <p className="font-medium">{new Date(application.endDate).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">รายละเอียดงาน</p>
                      <p className="text-gray-900">{application.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">คุณสมบัติที่ต้องการ</p>
                        <ul className="space-y-1">
                          {application.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">สิทธิประโยชน์</p>
                        <ul className="space-y-1">
                          {application.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="student" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      ข้อมูลนักศึกษา
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</p>
                        <p className="font-medium">{application.studentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">รหัสนักศึกษา</p>
                        <p className="font-medium">{application.studentId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                        <p className="font-medium">{application.studentEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                        <p className="font-medium">{application.studentPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ชั้นปี</p>
                        <p className="font-medium">{application.studentYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">สาขา</p>
                        <p className="font-medium">{application.major}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">เกรดเฉลี่ย</p>
                        <p className="font-medium">{application.gpa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Building className="w-5 h-5" />
                      ข้อมูลบริษัท
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ชื่อบริษัท</p>
                        <p className="font-medium">{application.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                        <p className="font-medium">{application.companyPhone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ที่อยู่</p>
                      <p className="font-medium">{application.companyAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">สถานที่ปฏิบัติงาน</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{application.location}</span>
                      </div>
                    </div>
                    {application.latitude && application.longitude && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">แผนที่</p>
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${application.longitude-0.01},${application.latitude-0.01},${application.longitude+0.01},${application.latitude+0.01}&layer=mapnik&marker=${application.latitude},${application.longitude}`}
                            width="100%"
                            height="100%"
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5" />
                      ประวัติการดำเนินการ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">อาจารย์ประจำวิชาอนุมัติ</p>
                          <p className="text-sm text-green-700">{application.instructorName}</p>
                          <p className="text-xs text-green-600">{new Date(application.instructorApprovedAt).toLocaleDateString('th-TH')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">ส่งคำขอ</p>
                          <p className="text-sm text-blue-700">{application.studentName}</p>
                          <p className="text-xs text-blue-600">{new Date(application.appliedAt).toLocaleDateString('th-TH')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            {application.status === 'pending' && (
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  ปฏิเสธ
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  อนุมัติ
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommitteeGuard>
  );
}
