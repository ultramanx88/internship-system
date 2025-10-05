'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Printer, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected' | 'documents_ready' | 'documents_delivered';
  createdAt: string;
  approvedAt?: string;
  documentStatus: 'not_printed' | 'printed' | 'delivered';
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - ในระบบจริงจะดึงจาก API
  useEffect(() => {
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
      },
      {
        id: 'app_002',
        studentId: 'std_002',
        studentName: 'นางสาวสมพร เก่งมาก',
        companyName: 'บริษัท อินโนเวชั่น จำกัด',
        status: 'approved',
        createdAt: '2024-10-01',
        approvedAt: '2024-10-02',
        documentStatus: 'printed'
      },
      {
        id: 'app_003',
        studentId: 'std_003',
        studentName: 'นายสมศักดิ์ ใจดี',
        companyName: 'บริษัท ดีไซน์ ครีเอทีฟ จำกัด',
        status: 'approved',
        createdAt: '2024-10-01',
        approvedAt: '2024-10-02',
        documentStatus: 'delivered'
      }
    ];
    
    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
    setIsLoading(false);
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

  const handlePrintDocuments = (type: 'request_letter' | 'response_form' | 'introduction_letter') => {
    if (selectedApplications.length === 0) {
      alert('กรุณาเลือกใบสมัครที่ต้องการพิมพ์เอกสาร');
      return;
    }

    // เปลี่ยนสถานะเป็น "ให้ติดต่อรับเอกสาร"
    const updatedApplications = applications.map(app => 
      selectedApplications.includes(app.id) 
        ? { ...app, documentStatus: 'printed' as const, status: 'documents_ready' as const }
        : app
    );
    
    setApplications(updatedApplications);
    setSelectedApplications([]);
    
    // ในระบบจริงจะเรียก API เพื่อพิมพ์เอกสาร
    console.log(`Printing ${type} for applications:`, selectedApplications);
    alert(`กำลังพิมพ์เอกสาร ${getDocumentTypeName(type)} สำหรับ ${selectedApplications.length} ใบสมัคร`);
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'request_letter': return 'หนังสือขอฝึกงาน';
      case 'response_form': return 'แบบตอบรับ';
      case 'introduction_letter': return 'หนังสือส่งตัว';
      default: return 'เอกสาร';
    }
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
    </div>
  );
}