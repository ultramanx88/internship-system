'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  dateApplied: string;
  projectTopic?: string;
  status: string;
  courseInstructorApprovedAt?: string;
  courseInstructorRejectedAt?: string;
  courseInstructorRejectionNote?: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    t_name?: string;
    t_surname?: string;
    e_name?: string;
    e_surname?: string;
    major?: {
      nameTh: string;
      nameEn?: string;
    };
    faculty?: {
      nameTh: string;
      nameEn?: string;
    };
  };
  internship: {
    id: string;
    title: string;
    company: {
      name: string;
      address: string;
      phone?: string;
      email?: string;
    };
  };
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  t_name?: string;
  t_surname?: string;
  e_name?: string;
  e_surname?: string;
}

interface ApplicationReviewModalProps {
  application: Application;
  onClose: () => void;
  onActionComplete: () => void;
}

export default function ApplicationReviewModal({ 
  application, 
  onClose, 
  onActionComplete 
}: ApplicationReviewModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');

  useEffect(() => {
    if (action === 'approve') {
      fetchSupervisors();
    }
  }, [action]);

  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/api/course-instructor/supervisors');
      const data = await response.json();
      
      if (data.success) {
        setSupervisors(data.supervisors || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'ไม่สามารถดึงรายชื่ออาจารย์นิเทศก์ได้',
          description: data.error || 'เกิดข้อผิดพลาด'
        });
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast({
        variant: 'destructive',
        title: 'ไม่สามารถดึงรายชื่ออาจารย์นิเทศก์ได้',
        description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedSupervisorId) {
      toast({
        variant: 'destructive',
        title: 'กรุณาเลือกอาจารย์นิเทศก์',
        description: 'ต้องเลือกอาจารย์นิเทศก์ก่อนอนุมัติคำขอ'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/course-instructor/applications/${application.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorId: selectedSupervisorId,
          feedback: feedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'อนุมัติคำขอเรียบร้อย',
          description: 'คำขอได้รับการอนุมัติและมอบหมายอาจารย์นิเทศก์แล้ว'
        });
        onActionComplete();
      } else {
        toast({
          variant: 'destructive',
          title: 'ไม่สามารถอนุมัติคำขอได้',
          description: data.error || 'เกิดข้อผิดพลาด'
        });
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        variant: 'destructive',
        title: 'ไม่สามารถอนุมัติคำขอได้',
        description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast({
        variant: 'destructive',
        title: 'กรุณาระบุเหตุผล',
        description: 'ต้องระบุเหตุผลในการไม่อนุมัติ'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/course-instructor/applications/${application.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionNote: rejectionNote.trim(),
          feedback: feedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'ปฏิเสธคำขอเรียบร้อย',
          description: 'คำขอได้รับการปฏิเสธและแจ้งให้นักศึกษาแล้ว'
        });
        onActionComplete();
      } else {
        toast({
          variant: 'destructive',
          title: 'ไม่สามารถปฏิเสธคำขอได้',
          description: data.error || 'เกิดข้อผิดพลาด'
        });
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        variant: 'destructive',
        title: 'ไม่สามารถปฏิเสธคำขอได้',
        description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case 'course_instructor_approved':
      case 'assigned_supervisor':
        return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
      case 'course_instructor_rejected':
        return <Badge className="bg-red-100 text-red-800">ไม่อนุมัติ</Badge>;
      case 'course_instructor_pending':
      case 'supervisor_assignment_pending':
        return <Badge className="bg-yellow-100 text-yellow-800">รอพิจารณา</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดคำขอฝึกงาน</DialogTitle>
          <DialogDescription>
            {application.student.t_name || application.student.e_name || application.student.name} - {application.internship.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* สถานะปัจจุบัน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สถานะปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  {getStatusBadge()}
                </div>
                <div>
                  <p className="text-sm text-gray-600">วันที่ส่งคำขอ</p>
                  <p className="text-sm font-medium">{formatDate(application.dateApplied)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลนักศึกษา */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">ชื่อ-นามสกุล</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {application.student.t_name || application.student.e_name || application.student.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">อีเมล</span>
                  </div>
                  <p className="text-sm text-gray-700">{application.student.email}</p>
                </div>
                {application.student.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">เบอร์โทรศัพท์</span>
                    </div>
                    <p className="text-sm text-gray-700">{application.student.phone}</p>
                  </div>
                )}
                {application.student.major && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">สาขาวิชา</span>
                    </div>
                    <p className="text-sm text-gray-700">{application.student.major.nameTh}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลการฝึกงาน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลการฝึกงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{application.internship.title}</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{application.internship.company.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{application.internship.company.address}</span>
                    </div>
                  </div>
                </div>
                {application.projectTopic && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">หัวข้อโครงการ</h5>
                    <p className="text-sm text-gray-700">{application.projectTopic}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* การดำเนินการ */}
          {(application.status === 'course_instructor_pending' || 
            application.status === 'supervisor_assignment_pending') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* หมายเหตุ */}
                  <div>
                    <Label htmlFor="feedback">หมายเหตุ (ไม่บังคับ)</Label>
                    <Textarea
                      id="feedback"
                      placeholder="หมายเหตุเพิ่มเติม..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* ปุ่มการดำเนินการ */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setAction('approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      อนุมัติ
                    </Button>
                    <Button
                      onClick={() => setAction('reject')}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      ไม่อนุมัติ
                    </Button>
                  </div>

                  {/* เลือกอาจารย์นิเทศก์ */}
                  {action === 'approve' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-green-800 mb-3">เลือกอาจารย์นิเทศก์</h5>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="supervisor">อาจารย์นิเทศก์</Label>
                          <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId}>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกอาจารย์นิเทศก์" />
                            </SelectTrigger>
                            <SelectContent>
                              {supervisors.map((supervisor) => (
                                <SelectItem key={supervisor.id} value={supervisor.id}>
                                  {supervisor.t_name || supervisor.e_name || supervisor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleApprove}
                            disabled={loading || !selectedSupervisorId}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการอนุมัติ'}
                          </Button>
                          <Button
                            onClick={() => setAction(null)}
                            variant="outline"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* กรอกเหตุผลไม่อนุมัติ */}
                  {action === 'reject' && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-medium text-red-800 mb-3">เหตุผลในการไม่อนุมัติ</h5>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rejectionNote">เหตุผล <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="rejectionNote"
                            placeholder="ระบุเหตุผลในการไม่อนุมัติคำขอ..."
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            rows={4}
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleReject}
                            disabled={loading || !rejectionNote.trim()}
                            variant="destructive"
                          >
                            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการไม่อนุมัติ'}
                          </Button>
                          <Button
                            onClick={() => setAction(null)}
                            variant="outline"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* แสดงผลการพิจารณาแล้ว */}
          {(application.status === 'course_instructor_approved' || 
            application.status === 'course_instructor_rejected') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ผลการพิจารณา</CardTitle>
              </CardHeader>
              <CardContent>
                {application.status === 'course_instructor_approved' && application.courseInstructorApprovedAt && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">อนุมัติแล้ว</span>
                    </div>
                    <p className="text-sm text-green-700">
                      อนุมัติเมื่อ: {formatDate(application.courseInstructorApprovedAt)}
                    </p>
                  </div>
                )}
                
                {application.status === 'course_instructor_rejected' && application.courseInstructorRejectedAt && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">ไม่อนุมัติ</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      ไม่อนุมัติเมื่อ: {formatDate(application.courseInstructorRejectedAt)}
                    </p>
                    {application.courseInstructorRejectionNote && (
                      <div className="mt-2 p-2 bg-red-100 rounded border">
                        <p className="text-sm text-red-800">
                          <strong>เหตุผล:</strong> {application.courseInstructorRejectionNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
