'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  UserCheck,
  Users
} from 'lucide-react';
import ApplicationReviewModal from '@/components/course-instructor/ApplicationReviewModal';

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
  courseInstructor?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CourseInstructorDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('pending_receipt');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/course-instructor/applications?action=${activeTab}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications || []);
        
        // คำนวณสถิติ
        if (activeTab === 'my_applications') {
          const pendingCount = data.applications.filter((app: Application) => 
            app.status === 'course_instructor_pending' || app.status === 'supervisor_assignment_pending'
          ).length;
          const approvedCount = data.applications.filter((app: Application) => 
            app.status === 'course_instructor_approved' || app.status === 'assigned_supervisor'
          ).length;
          const rejectedCount = data.applications.filter((app: Application) => 
            app.status === 'course_instructor_rejected'
          ).length;
          
          setStats({
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            total: data.applications.length
          });
        }
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

  const handleActionComplete = () => {
    fetchApplications();
    setSelectedApplication(null);
  };

  const getStatusBadge = (application: Application) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderApplicationsTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p>ไม่มีข้อมูล</p>
        </div>
      );
    }

    return (
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
                  {application.student.major && (
                    <div className="text-xs text-gray-400">
                      {application.student.major.nameTh}
                    </div>
                  )}
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
                {getStatusBadge(application)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    ดู
                  </Button>
                  {(application.status === 'course_instructor_pending' || 
                    application.status === 'supervisor_assignment_pending') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      จัดการ
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Instructor Dashboard</h2>
        <Button onClick={fetchApplications} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* สถิติ */}
      {activeTab === 'my_applications' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รอพิจารณา</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">อนุมัติแล้ว</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ไม่อนุมัติ</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending_receipt">
            <Clock className="h-4 w-4 mr-2" />
            รอรับคำขอ
          </TabsTrigger>
          <TabsTrigger value="my_applications">
            <FileText className="h-4 w-4 mr-2" />
            คำขอของฉัน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending_receipt">
          <Card>
            <CardHeader>
              <CardTitle>รายการที่รอรับคำขอ</CardTitle>
            </CardHeader>
            <CardContent>
              {renderApplicationsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my_applications">
          <Card>
            <CardHeader>
              <CardTitle>คำขอที่ฉันรับแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              {renderApplicationsTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Review Modal */}
      {selectedApplication && (
        <ApplicationReviewModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
