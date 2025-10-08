'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  User, 
  Building, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  position: string;
  type: 'internship' | 'co_op';
  status: string;
  dateApplied: string;
  currentApprovals: number;
  requiredApprovals: number;
  pendingCommitteeReview: boolean;
  studentReason?: string;
  expectedSkills?: string[];
  projectProposal?: string;
  preferredStartDate?: string;
  availableDuration?: number;
  feedback?: string;
  committeeDecision?: string;
  committeeComments?: string;
  faculty?: string;
  department?: string;
  major?: string;
}

export default function CommitteeApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | ''>('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/committee/applications/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setDecision(data.committeeDecision || '');
        setComments(data.committeeComments || '');
      } else {
        console.error('Failed to fetch application');
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลคำขอได้'
        });
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลคำขอได้'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDecision = async () => {
    if (!decision) {
      toast({
        variant: 'destructive',
        title: 'กรุณาเลือกการตัดสินใจ',
        description: 'กรุณาเลือกอนุมัติหรือไม่อนุมัติ'
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/committee/applications/${params.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          comments
        }),
      });

      if (response.ok) {
        toast({
          title: 'บันทึกการตัดสินใจสำเร็จ',
          description: 'การตัดสินใจได้รับการบันทึกเรียบร้อยแล้ว'
        });
        
        // กลับไปหน้า applications
        router.push('/educator/committee/applications');
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: errorData.message || 'ไม่สามารถบันทึกการตัดสินใจได้'
        });
      }
    } catch (error) {
      console.error('Error saving decision:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตัดสินใจได้'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (app: Application) => {
    if (app.pendingCommitteeReview) {
      if (app.currentApprovals >= app.requiredApprovals) {
        return <Badge className="bg-green-100 text-green-700">กรรมการอนุมัติแล้ว</Badge>;
      } else {
        return <Badge className="bg-orange-100 text-orange-700">
          รอกรรมการ ({app.currentApprovals}/{app.requiredApprovals})
        </Badge>;
      }
    }

    switch (app.status) {
      case 'รอตรวจสอบ':
        return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
      case 'อนุมัติแล้ว':
        return <Badge className="bg-green-100 text-green-700">อนุมัติแล้ว</Badge>;
      case 'ต้องแก้ไข':
        return <Badge className="bg-red-100 text-red-700">ต้องแก้ไข</Badge>;
      case 'เสร็จสิ้น':
        return <Badge className="bg-blue-100 text-blue-700">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="secondary">{app.status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'internship' ? 
      <Badge variant="outline" className="text-blue-600">ฝึกงาน</Badge> :
      <Badge variant="outline" className="text-green-600">สหกิจศึกษา</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">ไม่พบข้อมูลคำขอ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/educator/committee/applications')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอ</h1>
            <p className="text-gray-600">รหัสเอกสาร: {application.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(application)}
          {getTypeBadge(application.type)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
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
                  <p className="text-sm">{application.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">รหัสนักศึกษา</Label>
                  <p className="text-sm">{application.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">อีเมล</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {application.studentEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {application.studentPhone || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">คณะ</Label>
                  <p className="text-sm">{application.faculty || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">สาขา</Label>
                  <p className="text-sm">{application.department || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">วิชาเอก</Label>
                  <p className="text-sm">{application.major || 'ไม่ระบุ'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                ข้อมูลสถานประกอบการ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ชื่อบริษัท</Label>
                  <p className="text-sm">{application.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ตำแหน่ง</Label>
                  <p className="text-sm">{application.position || 'ไม่ระบุ'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">ที่อยู่</Label>
                  <p className="text-sm flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    {application.companyAddress || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {application.companyPhone || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายละเอียดการสมัคร
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.studentReason && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">เหตุผลในการสมัคร</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {application.studentReason}
                  </p>
                </div>
              )}

              {application.expectedSkills && application.expectedSkills.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">ทักษะที่คาดหวัง</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.expectedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.projectProposal && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">โครงการที่เสนอ</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {application.projectProposal}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.preferredStartDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">วันที่ต้องการเริ่ม</Label>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(application.preferredStartDate)}
                    </p>
                  </div>
                )}
                {application.availableDuration && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ระยะเวลาที่สามารถฝึกงานได้</Label>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {application.availableDuration} เดือน
                    </p>
                  </div>
                )}
              </div>

              {application.feedback && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">ความคิดเห็นเพิ่มเติม</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {application.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decision Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                การตัดสินใจของกรรมการ
              </CardTitle>
              <CardDescription>
                กรุณาตัดสินใจอนุมัติหรือไม่อนุมัติคำขอนี้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">การตัดสินใจ</Label>
                <div className="space-y-2">
                  <Button
                    variant={decision === 'approve' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setDecision('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติ
                  </Button>
                  <Button
                    variant={decision === 'reject' ? 'destructive' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setDecision('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    ไม่อนุมัติ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments" className="text-sm font-medium">
                  ความคิดเห็น (ไม่บังคับ)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="กรอกความคิดเห็นเพิ่มเติม..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDecision}
                  disabled={!decision || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  บันทึกการตัดสินใจ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">สถานะคำขอ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>วันที่ยื่นคำขอ:</span>
                <span>{formatDate(application.dateApplied)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>กรรมการที่อนุมัติ:</span>
                <span>{application.currentApprovals}/{application.requiredApprovals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>สถานะ:</span>
                <span>{getStatusBadge(application)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

