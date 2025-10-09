'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  dateApplied: string;
  projectTopic?: string;
  feedback?: string;
  student: {
    id: string;
    name: string;
    email: string;
    t_name?: string;
    e_name?: string;
  };
  internship: {
    id: string;
    title: string;
    company: {
      name: string;
      address: string;
    };
  };
}

export default function StaffReviewTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/review');
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || 'ไม่สามารถดึงข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application: Application, status: 'approved' | 'rejected') => {
    setSelectedApplication(application);
    setReviewStatus(status);
    setReviewFeedback('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication || !reviewStatus) return;

    if (reviewStatus === 'rejected' && !reviewFeedback.trim()) {
      alert('กรุณาใส่เหตุผลในการปฏิเสธ');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/staff/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: reviewStatus,
          feedback: reviewFeedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setReviewDialogOpen(false);
        setSelectedApplication(null);
        setReviewStatus(null);
        setReviewFeedback('');
        fetchApplications(); // รีเฟรชข้อมูล
      } else {
        alert(data.error || 'ไม่สามารถดำเนินการได้');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>รายการที่รอตรวจสอบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>รายการที่รอตรวจสอบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>รายการที่รอตรวจสอบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>ไม่มีคำขอที่รอตรวจสอบ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>รายการที่รอตรวจสอบ ({applications.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>การฝึกงาน</TableHead>
                <TableHead>หัวข้อโครงการ</TableHead>
                <TableHead>วันที่ส่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {application.student.t_name || application.student.e_name || application.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.student.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.internship.title}</div>
                      <div className="text-sm text-gray-500">
                        {application.internship.company.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.projectTopic || '-'}
                  </TableCell>
                  <TableCell>
                    {formatDate(application.dateApplied)}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      รอตรวจสอบ
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(application, 'approved')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        อนุมัติ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(application, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        ปฏิเสธ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewStatus === 'approved' ? 'อนุมัติคำขอฝึกงาน' : 'ปฏิเสธคำขอฝึกงาน'}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  นักศึกษา: {selectedApplication.student.t_name || selectedApplication.student.e_name || selectedApplication.student.name}
                  <br />
                  การฝึกงาน: {selectedApplication.internship.title}
                  <br />
                  บริษัท: {selectedApplication.internship.company.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">
                {reviewStatus === 'approved' ? 'หมายเหตุ (ไม่บังคับ)' : 'เหตุผลในการปฏิเสธ *'}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  reviewStatus === 'approved' 
                    ? 'หมายเหตุเพิ่มเติม...'
                    : 'กรุณาใส่เหตุผลในการปฏิเสธ...'
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={4}
                required={reviewStatus === 'rejected'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || (reviewStatus === 'rejected' && !reviewFeedback.trim())}
              className={reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {submitting ? 'กำลังดำเนินการ...' : 
               reviewStatus === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
