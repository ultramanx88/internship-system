'use client';

import { useState, useEffect } from 'react';
import { CommitteeMenu } from '@/components/committee/CommitteeMenu';
import { CommitteeGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
// import { toast } from 'sonner';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  companyName: string;
  position: string;
  internshipType: 'internship' | 'co_op';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  approvedByInstructor: boolean;
  location?: string;
  duration?: string;
}

export default function CommitteeApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - ในระบบจริงจะดึงจาก API
  useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: 'app_001',
        studentId: 's6800001',
        studentName: 'นาย สมชาย ใจดี',
        studentEmail: 'somchai@example.com',
        companyName: 'บริษัท ABC จำกัด',
        position: 'นักพัฒนาซอฟต์แวร์',
        internshipType: 'internship',
        status: 'pending',
        appliedAt: '2024-01-15',
        approvedByInstructor: true,
        location: 'กรุงเทพมหานคร',
        duration: '4 เดือน'
      },
      {
        id: 'app_002',
        studentId: 's6800002',
        studentName: 'นางสาว สุดา ใจงาม',
        studentEmail: 'suda@example.com',
        companyName: 'บริษัท XYZ จำกัด',
        position: 'นักวิเคราะห์ข้อมูล',
        internshipType: 'co_op',
        status: 'pending',
        appliedAt: '2024-01-16',
        approvedByInstructor: true,
        location: 'เชียงใหม่',
        duration: '6 เดือน'
      },
      {
        id: 'app_003',
        studentId: 's6800003',
        studentName: 'นาย วิชัย เก่งมาก',
        studentEmail: 'wichai@example.com',
        companyName: 'บริษัท DEF จำกัด',
        position: 'นักออกแบบ UX/UI',
        internshipType: 'internship',
        status: 'approved',
        appliedAt: '2024-01-10',
        approvedByInstructor: true,
        location: 'ภูเก็ต',
        duration: '3 เดือน'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus && app.approvedByInstructor;
  });

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

  return (
    <CommitteeGuard>
      <div className="flex h-screen bg-gray-100">
        <CommitteeMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">รายการคำขอสหกิจศึกษา</h1>
            <p className="text-gray-600">คำขอที่อาจารย์ประจำวิชาอนุมัติแล้ว รอการพิจารณาจากกรรมการ</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาด้วยชื่อนักศึกษา, บริษัท, หรืออีเมล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="pending">รอการพิจารณา</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  กรอง
                </Button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบคำขอ</h3>
                    <p className="text-gray-600">ไม่มีคำขอที่ตรงกับเงื่อนไขการค้นหา</p>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{app.studentName}</h3>
                            {getStatusBadge(app.status)}
                            {getTypeBadge(app.internshipType)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">บริษัท</p>
                              <p className="font-medium">{app.companyName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">ตำแหน่ง</p>
                              <p className="font-medium">{app.position}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                              <p className="font-medium">{app.studentEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">วันที่สมัคร</p>
                              <p className="font-medium">{new Date(app.appliedAt).toLocaleDateString('th-TH')}</p>
                            </div>
                          </div>

                          {app.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{app.location}</span>
                            </div>
                          )}

                          {app.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>ระยะเวลา: {app.duration}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button asChild>
                            <Link href={`/committee/applications/${app.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              ดูรายละเอียด
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </CommitteeGuard>
  );
}
