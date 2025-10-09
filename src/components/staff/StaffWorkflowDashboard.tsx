'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  Send, 
  Package, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import StaffWorkflowStatus from './StaffWorkflowStatus';
import StaffWorkflowActions from './StaffWorkflowActions';

interface Application {
  id: string;
  dateApplied: string;
  projectTopic?: string;
  staffWorkflowStep?: string;
  documentReceived: boolean;
  documentReviewed: boolean;
  documentApproved: boolean;
  documentSentToCompany: boolean;
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

export default function StaffWorkflowDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending_receipt');

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/workflow?action=${activeTab}`);
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

  const handlePreview = (application: Application) => {
    setSelectedApplication(application);
    setPreviewOpen(true);
  };

  const handleActionComplete = () => {
    fetchApplications();
  };

  const getStatusBadge = (application: Application) => {
    if (application.documentSentToCompany) {
      return <Badge className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>;
    } else if (application.documentApproved) {
      return <Badge className="bg-purple-100 text-purple-800">รอส่งให้บริษัท</Badge>;
    } else if (application.documentReviewed) {
      return <Badge className="bg-yellow-100 text-yellow-800">รออนุมัติ</Badge>;
    } else if (application.documentReceived) {
      return <Badge className="bg-blue-100 text-blue-800">รอตรวจ</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">รอรับเอกสาร</Badge>;
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
                    onClick={() => handlePreview(application)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    ดู
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    จัดการ
                  </Button>
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
        <h2 className="text-2xl font-bold">Staff Workflow Dashboard</h2>
        <Button onClick={fetchApplications} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending_receipt">
            <Clock className="h-4 w-4 mr-2" />
            รอรับเอกสาร
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <FileText className="h-4 w-4 mr-2" />
            กำลังดำเนินการ
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            เสร็จสิ้น
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending_receipt">
          <Card>
            <CardHeader>
              <CardTitle>รายการที่รอรับเอกสาร</CardTitle>
            </CardHeader>
            <CardContent>
              {renderApplicationsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>รายการที่กำลังดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              {renderApplicationsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>รายการที่เสร็จสิ้น</CardTitle>
            </CardHeader>
            <CardContent>
              {renderApplicationsTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Management Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>จัดการคำขอฝึกงาน</DialogTitle>
              <DialogDescription>
                {selectedApplication.student.t_name || selectedApplication.student.e_name || selectedApplication.student.name} - {selectedApplication.internship.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <StaffWorkflowStatus 
                applicationId={selectedApplication.id}
                onStatusChange={handleActionComplete}
              />
              
              <StaffWorkflowActions 
                applicationId={selectedApplication.id}
                workflowStatus={selectedApplication}
                onActionComplete={handleActionComplete}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                ปิด
              </Button>
              <Button onClick={() => handlePreview(selectedApplication)}>
                <Eye className="h-4 w-4 mr-2" />
                ดูเอกสาร
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Preview Dialog */}
      {selectedApplication && (
        <DocumentPreview
          application={selectedApplication}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
