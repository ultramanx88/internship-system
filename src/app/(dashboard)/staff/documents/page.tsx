'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Printer, Search, Filter, Eye, Users, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  position?: string;
  major?: string;
  status: 'pending' | 'approved' | 'rejected' | 'documents_ready' | 'documents_delivered';
  createdAt: string;
  approvedAt?: string;
  documentStatus: 'not_printed' | 'printed' | 'delivered';
  supervisor?: {
    name: string;
    email: string;
  };
  committees?: Array<{
    name: string;
    members: Array<{
      name: string;
      role: string;
    }>;
  }>;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/applications/print');
        const data = await response.json();
        
        if (data.applications) {
          const formattedApplications: Application[] = data.applications.map((app: any) => ({
            id: app.id,
            studentId: app.studentId,
            studentName: app.studentName,
            companyName: app.companyName,
            status: app.status,
            createdAt: app.dateApplied,
            approvedAt: app.dateApplied, // ใช้ dateApplied เป็น approvedAt
            documentStatus: app.isPrinted ? 'printed' : 'not_printed'
          }));
          
          setApplications(formattedApplications);
          setFilteredApplications(formattedApplications);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        // Fallback to mock data if API fails
        const mockApplications: Application[] = [
          {
            id: 'app_001',
            studentId: 'std_001',
            studentName: 'นายสมชาย ใจดี',
            companyName: 'บริษัท เทคโนโลยี จำกัด',
            status: 'approved',
            createdAt: '2024-10-01',
            approvedAt: '2024-10-02',
            documentStatus: 'not_printed'
          }
        ];
        setApplications(mockApplications);
        setFilteredApplications(mockApplications);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.documentStatus === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const handlePrintDocuments = async (type: 'request_letter' | 'response_form' | 'introduction_letter') => {
    if (selectedApplications.length === 0) {
      alert('กรุณาเลือกใบสมัครที่ต้องการพิมพ์เอกสาร');
      return;
    }

    try {
      // สร้างเลขที่เอกสารและวันที่
      const documentNumber = `DOC-${Date.now()}`;
      const documentDate = new Date().toISOString().split('T')[0];

      const response = await fetch('/api/applications/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          documentNumber: documentNumber,
          documentDate: documentDate
        })
      });

      const data = await response.json();

      if (data.success) {
        // อัปเดตสถานะใน UI
        const updatedApplications = applications.map(app => 
          selectedApplications.includes(app.id) 
            ? { ...app, documentStatus: 'printed' as const, status: 'documents_ready' as const }
            : app
        );
        
        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        setSelectedApplications([]);
        
        alert(`พิมพ์เอกสาร ${getDocumentTypeName(type)} สำเร็จสำหรับ ${selectedApplications.length} ใบสมัคร`);
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      console.error('Error printing documents:', error);
      alert('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'request_letter': return 'หนังสือขอฝึกงาน';
      case 'response_form': return 'แบบตอบรับ';
      case 'introduction_letter': return 'หนังสือส่งตัว';
      default: return 'เอกสาร';
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

    const getStatusBadge = (status: string) => {
        switch (status) {
      case 'not_printed':
        return <Badge variant="secondary">ยังไม่ได้พิมพ์</Badge>;
      case 'printed':
        return <Badge variant="warning">พิมพ์แล้ว</Badge>;
      case 'delivered':
        return <Badge variant="success">ส่งมอบแล้ว</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการเอกสาร</h1>
          <p className="text-gray-600">พิมพ์และจัดการเอกสารสำหรับการฝึกงาน</p>
                    </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                  id="search"
                  placeholder="ค้นหาชื่อนักศึกษา หรือ บริษัท"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">สถานะเอกสาร</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="not_printed">ยังไม่ได้พิมพ์</SelectItem>
                  <SelectItem value="printed">พิมพ์แล้ว</SelectItem>
                  <SelectItem value="delivered">ส่งมอบแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>การดำเนินการ</Label>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedApplications.length === filteredApplications.length ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Actions */}
      <Card>
        <CardHeader>
          <CardTitle>พิมพ์เอกสาร</CardTitle>
          <CardDescription>
            เลือกใบสมัครที่ต้องการพิมพ์เอกสาร (เลือกแล้ว: {selectedApplications.length} ใบ)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handlePrintDocuments('request_letter')}
              disabled={selectedApplications.length === 0}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              พิมพ์หนังสือขอฝึกงาน
            </Button>
            <Button
              onClick={() => handlePrintDocuments('response_form')}
              disabled={selectedApplications.length === 0}
              variant="outline"
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              พิมพ์แบบตอบรับ
            </Button>
            <Button
              onClick={() => handlePrintDocuments('introduction_letter')}
              disabled={selectedApplications.length === 0}
              variant="outline"
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              พิมพ์หนังสือส่งตัว
                            </Button>
                        </div>
                    </CardContent>
                </Card>

      {/* Applications Table */}
      <Card>
                    <CardHeader>
          <CardTitle>รายการใบสมัครที่อนุมัติแล้ว</CardTitle>
          <CardDescription>
            จำนวน {filteredApplications.length} ใบสมัคร
          </CardDescription>
                    </CardHeader>
                    <CardContent>
                            <Table>
                                <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>วันที่อนุมัติ</TableHead>
                <TableHead>สถานะเอกสาร</TableHead>
                <TableHead>การดำเนินการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                                            <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleSelectApplication(application.id)}
                      className="rounded"
                    />
                                            </TableCell>
                  <TableCell className="font-medium">{application.studentName}</TableCell>
                  <TableCell>{application.companyName}</TableCell>
                  <TableCell>{application.approvedAt}</TableCell>
                  <TableCell>{getStatusBadge(application.documentStatus)}</TableCell>
                                            <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        ดูรายละเอียด
                                                    </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        ดาวน์โหลด
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedApplication(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">รายละเอียดใบสมัคร</h2>
              <p className="text-gray-600">ข้อมูลการอนุมัติและการมอบหมาย</p>
            </div>

            <div className="space-y-6">
              {/* ข้อมูลนักศึกษา */}
              <Card className="border-l-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    ข้อมูลนักศึกษา
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">ชื่อ-นามสกุล:</span>
                      <p className="font-medium">{selectedApplication.studentName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">รหัสนักศึกษา:</span>
                      <p className="font-medium">{selectedApplication.studentId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">สาขาวิชา:</span>
                      <p className="font-medium">{selectedApplication.major || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">บริษัท:</span>
                      <p className="font-medium">{selectedApplication.companyName}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">ตำแหน่งงาน:</span>
                      <p className="font-medium">{selectedApplication.position || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ข้อมูลอาจารย์นิเทศ */}
              {selectedApplication.supervisor && (
                <Card className="border-l-4 border-green-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      อาจารย์นิเทศ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">ชื่อ-นามสกุล:</span>
                        <p className="font-medium">{selectedApplication.supervisor.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">อีเมล:</span>
                        <p className="font-medium">{selectedApplication.supervisor.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ข้อมูลกรรมการ */}
              {selectedApplication.committees && selectedApplication.committees.length > 0 && (
                <Card className="border-l-4 border-amber-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-600" />
                      กรรมการที่ได้รับมอบหมาย
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedApplication.committees.map((committee, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{committee.name}</h4>
                        <div className="space-y-1">
                          {committee.members.map((member, memberIndex) => (
                            <div key={memberIndex} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.role === 'chair' ? 'ประธาน' : 
                                 member.role === 'secretary' ? 'เลขา' : 'กรรมการ'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    </CardContent>
                </Card>
              )}

              {/* สถานะเอกสาร */}
              <Card className="border-l-4 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    สถานะเอกสาร
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">สถานะการอนุมัติ:</span>
                      <p className="font-medium">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          อนุมัติแล้ว
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">สถานะเอกสาร:</span>
                      <p className="font-medium">{getStatusBadge(selectedApplication.documentStatus)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">วันที่อนุมัติ:</span>
                      <p className="font-medium">{selectedApplication.approvedAt}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">วันที่สมัคร:</span>
                      <p className="font-medium">{selectedApplication.createdAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ปุ่มดำเนินการ */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setSelectedApplications([selectedApplication.id]);
                    setShowDetailsModal(false);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  พิมพ์เอกสาร
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  ดาวน์โหลดเอกสาร
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApplication(null);
                  }}
                >
                  ปิด
                </Button>
              </div>
            </div>
            </div>
        </div>
      )}
        </div>
    );
}