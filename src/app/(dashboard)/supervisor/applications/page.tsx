'use client';

import { useState, useEffect } from 'react';
import { SupervisorGuard } from '@/components/auth/PermissionGuard';
import { SupervisorMenu } from '@/components/supervisor/SupervisorMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Building,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  dateApplied: string;
  documents: string[];
  supervisorStatus: 'not_assigned' | 'assigned' | 'accepted' | 'rejected';
  assignmentDate?: string;
  responseDate?: string;
}

export default function SupervisorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - ในระบบจริงจะดึงจาก API
  useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: 'app_001',
        studentId: 's6800001',
        studentName: 'นาย สมชาย ใจดี',
        companyName: 'บริษัท เทคโนโลยี จำกัด',
        position: 'นักพัฒนาซอฟต์แวร์',
        status: 'approved',
        dateApplied: '2024-01-15',
        documents: ['ใบสมัครฝึกงาน', 'ใบรับรองจากอาจารย์', 'Transcript'],
        supervisorStatus: 'assigned',
        assignmentDate: '2024-01-16',
        responseDate: '2024-01-17'
      },
      {
        id: 'app_002',
        studentId: 's6800002',
        studentName: 'นางสาว สุดา ใจงาม',
        companyName: 'บริษัท การตลาด จำกัด',
        position: 'นักการตลาดดิจิทัล',
        status: 'approved',
        dateApplied: '2024-01-14',
        documents: ['ใบสมัครฝึกงาน', 'ใบรับรองจากอาจารย์'],
        supervisorStatus: 'accepted',
        assignmentDate: '2024-01-15',
        responseDate: '2024-01-16'
      },
      {
        id: 'app_003',
        studentId: 's6800003',
        studentName: 'นาย วิชัย เก่งมาก',
        companyName: 'บริษัท วิศวกรรม จำกัด',
        position: 'วิศวกรซอฟต์แวร์',
        status: 'approved',
        dateApplied: '2024-01-13',
        documents: ['ใบสมัครฝึกงาน', 'ใบรับรองจากอาจารย์', 'Portfolio'],
        supervisorStatus: 'not_assigned',
        assignmentDate: '2024-01-14'
      },
      {
        id: 'app_004',
        studentId: 's6800004',
        studentName: 'นางสาว มาลี สวยงาม',
        companyName: 'บริษัท การเงิน จำกัด',
        position: 'นักวิเคราะห์ข้อมูล',
        status: 'in_progress',
        dateApplied: '2024-01-12',
        documents: ['ใบสมัครฝึกงาน'],
        supervisorStatus: 'rejected',
        assignmentDate: '2024-01-13',
        responseDate: '2024-01-14'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">รอดำเนินการ</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">ปฏิเสธ</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">กำลังดำเนินการ</Badge>;
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getSupervisorStatusBadge = (status: string) => {
    switch (status) {
      case 'not_assigned':
        return <Badge variant="outline" className="text-gray-600">ยังไม่ได้รับมอบหมาย</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">ได้รับมอบหมาย</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">ตอบรับแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getSupervisorStatusIcon = (status: string) => {
    switch (status) {
      case 'not_assigned':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.supervisorStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <SupervisorGuard>
        <div className="flex h-screen bg-gray-50">
          <SupervisorMenu />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </SupervisorGuard>
    );
  }

  return (
    <SupervisorGuard>
      <div className="flex h-screen bg-gray-50">
        <SupervisorMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">รายการเอกสาร</h1>
            <p className="text-gray-600">จัดการเอกสารและตอบรับการมอบหมายนิเทศนักศึกษา</p>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="ค้นหานักศึกษา, บริษัท, หรือรหัสนักศึกษา..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="not_assigned">ยังไม่ได้รับมอบหมาย</option>
                        <option value="assigned">ได้รับมอบหมาย</option>
                        <option value="accepted">ตอบรับแล้ว</option>
                        <option value="rejected">ปฏิเสธ</option>
                      </select>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        กรอง
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              {getSupervisorStatusIcon(application.supervisorStatus)}
                              <h3 className="font-semibold text-lg">{application.studentName}</h3>
                            </div>
                            <span className="text-gray-500">({application.studentId})</span>
                            {getStatusBadge(application.status)}
                            {getSupervisorStatusBadge(application.supervisorStatus)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-4 w-4" />
                              <span>{application.companyName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{application.position}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>ยื่นคำขอ: {new Date(application.dateApplied).toLocaleDateString('th-TH')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>เอกสาร: {application.documents.length} ไฟล์</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {application.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/supervisor/applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                          
                          {application.supervisorStatus === 'assigned' && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                ตอบรับ
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                ปฏิเสธ
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                      <p className="text-gray-600">ไม่พบรายการเอกสารที่ตรงกับเงื่อนไขการค้นหา</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </SupervisorGuard>
  );
}
