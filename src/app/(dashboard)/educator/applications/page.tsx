'use client';

import { useState, useEffect } from 'react';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    studentId: string;
  };
  internship: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
}

export default function EducatorApplicationsPage() {
  const { user, educatorRole, isLoading } = useEducatorRole();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isLoading) {
      loadApplications();
    }
  }, [user, isLoading]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/educator/applications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />รอการตรวจสอบ</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            เกิดข้อผิดพลาด: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการใบสมัคร</h1>
        <p className="text-gray-600 mt-1">
          ตรวจสอบและจัดการใบสมัครฝึกงานของนักศึกษา
          {educatorRole && (
            <span className="ml-2 text-sm text-blue-600">
              ({educatorRole.name})
            </span>
          )}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รอการตรวจสอบ</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{approvedApplications.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ปฏิเสธ</p>
                <p className="text-2xl font-bold text-red-600">{rejectedApplications.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการใบสมัครทั้งหมด</CardTitle>
          <CardDescription>
            ใบสมัครฝึกงานที่ต้องตรวจสอบและจัดการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>นักศึกษา</TableHead>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>การฝึกงาน</TableHead>
                  <TableHead>บริษัท</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.student.name}</TableCell>
                    <TableCell>{app.student.studentId}</TableCell>
                    <TableCell>{app.internship.title}</TableCell>
                    <TableCell>{app.internship.company.name}</TableCell>
                    <TableCell>
                      {new Date(app.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/educator/applications/${app.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          ตรวจสอบ
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่มีใบสมัครที่ต้องตรวจสอบ</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
