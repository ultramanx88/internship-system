'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  dateApplied: string;
  projectTopic?: string;
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
    t_name?: string;
    t_surname?: string;
    e_name?: string;
    e_surname?: string;
    major?: {
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
    };
  };
  supervisor?: {
    id: string;
    name: string;
    email: string;
  };
  committees?: Array<{
    id: string;
    status: string;
    notes?: string;
    reviewedAt?: string;
    committee: {
      id: string;
      name: string;
      members: Array<{
        id: string;
        role: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }>;
    };
  }>;
}

interface CommitteeReviewActionsProps {
  application: Application;
  onClose: () => void;
  onActionComplete: () => void;
}

export default function CommitteeReviewActions({ 
  application, 
  onClose, 
  onActionComplete 
}: CommitteeReviewActionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/committee/applications/${application.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          notes: notes.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'อนุมัติคำขอเรียบร้อย',
          description: data.message || 'คำขอได้รับการอนุมัติแล้ว'
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
    if (!notes.trim()) {
      toast({
        variant: 'destructive',
        title: 'กรุณาระบุเหตุผล',
        description: 'ต้องระบุเหตุผลในการไม่อนุมัติ'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/committee/applications/${application.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          notes: notes.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'ปฏิเสธคำขอเรียบร้อย',
          description: data.message || 'คำขอได้รับการปฏิเสธแล้ว'
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

  // คำนวณสถานะการอนุมัติของกรรมการ
  const getCommitteeStatus = () => {
    if (!application.committees || application.committees.length === 0) {
      return { approved: 0, rejected: 0, pending: 0, total: 0 };
    }

    const approved = application.committees.filter(c => c.status === 'approved').length;
    const rejected = application.committees.filter(c => c.status === 'rejected').length;
    const pending = application.committees.filter(c => c.status === 'pending').length;
    const total = application.committees.length;

    return { approved, rejected, pending, total };
  };

  const committeeStatus = getCommitteeStatus();

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>พิจารณาคำขอฝึกงาน</DialogTitle>
          <DialogDescription>
            {application.student.t_name || application.student.e_name || application.student.name} - {application.internship.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* สถานะการอนุมัติของกรรมการ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สถานะการอนุมัติของกรรมการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{committeeStatus.approved}</div>
                  <div className="text-sm text-gray-600">อนุมัติ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{committeeStatus.rejected}</div>
                  <div className="text-sm text-gray-600">ไม่อนุมัติ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{committeeStatus.pending}</div>
                  <div className="text-sm text-gray-600">รอพิจารณา</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{committeeStatus.total}</div>
                  <div className="text-sm text-gray-600">ทั้งหมด</div>
                </div>
              </div>
              
              {committeeStatus.total > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>เกณฑ์การอนุมัติ:</strong> ต้องได้รับอนุมัติมากกว่า 50% ของกรรมการทั้งหมด 
                    ({Math.ceil(committeeStatus.total / 2)} จาก {committeeStatus.total} คน)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* รายละเอียดคำขอ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดคำขอ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900">นักศึกษา</h5>
                    <p className="text-sm text-gray-700">
                      {application.student.t_name || application.student.e_name || application.student.name}
                    </p>
                    <p className="text-sm text-gray-500">{application.student.email}</p>
                    {application.student.major && (
                      <p className="text-sm text-gray-500">{application.student.major.nameTh}</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">การฝึกงาน</h5>
                    <p className="text-sm text-gray-700">{application.internship.title}</p>
                    <p className="text-sm text-gray-500">{application.internship.company.name}</p>
                  </div>
                </div>
                
                {application.projectTopic && (
                  <div>
                    <h5 className="font-medium text-gray-900">หัวข้อโครงการ</h5>
                    <p className="text-sm text-gray-700">{application.projectTopic}</p>
                  </div>
                )}
                
                {application.supervisor && (
                  <div>
                    <h5 className="font-medium text-gray-900">อาจารย์นิเทศก์</h5>
                    <p className="text-sm text-gray-700">{application.supervisor.name}</p>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium text-gray-900">วันที่ส่งคำขอ</h5>
                  <p className="text-sm text-gray-700">{formatDate(application.dateApplied)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* การพิจารณาของกรรมการคนอื่น */}
          {application.committees && application.committees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การพิจารณาของกรรมการคนอื่น</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.committees.map((committee) => (
                    <div key={committee.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium text-gray-900">{committee.committee.name}</h6>
                        <Badge 
                          className={
                            committee.status === 'approved' ? 'bg-green-100 text-green-800' :
                            committee.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {committee.status === 'approved' ? 'อนุมัติ' :
                           committee.status === 'rejected' ? 'ไม่อนุมัติ' :
                           'รอพิจารณา'}
                        </Badge>
                      </div>
                      
                      {committee.reviewedAt && (
                        <p className="text-xs text-gray-500 mb-1">
                          พิจารณาเมื่อ: {formatDate(committee.reviewedAt)}
                        </p>
                      )}
                      
                      {committee.notes && (
                        <p className="text-sm text-gray-700">
                          <strong>หมายเหตุ:</strong> {committee.notes}
                        </p>
                      )}
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">กรรมการ:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {committee.committee.members.map((member) => (
                            <span key={member.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {member.user.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* การดำเนินการ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* หมายเหตุ */}
                <div>
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea
                    id="notes"
                    placeholder="หมายเหตุเพิ่มเติม..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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

                {/* ยืนยันการอนุมัติ */}
                {action === 'approve' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-3">ยืนยันการอนุมัติ</h5>
                    <p className="text-sm text-green-700 mb-3">
                      คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอฝึกงานนี้?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={loading}
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
                )}

                {/* ยืนยันการไม่อนุมัติ */}
                {action === 'reject' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h5 className="font-medium text-red-800 mb-3">ยืนยันการไม่อนุมัติ</h5>
                    <p className="text-sm text-red-700 mb-3">
                      คุณแน่ใจหรือไม่ที่จะไม่อนุมัติคำขอฝึกงานนี้? ต้องระบุเหตุผลในการไม่อนุมัติ
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReject}
                        disabled={loading || !notes.trim()}
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
                )}
              </div>
            </CardContent>
          </Card>
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
