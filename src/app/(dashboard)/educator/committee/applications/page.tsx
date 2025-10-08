'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building,
  Calendar,
  FileText,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  companyName: string;
  position: string;
  type: 'internship' | 'co_op';
  status: string;
  dateApplied: string;
  currentApprovals: number;
  requiredApprovals: number;
  pendingCommitteeReview: boolean;
  studentReason?: string;
  expectedSkills?: string[];
  projectProposal?: string;
  preferredStartDate?: string;
  availableDuration?: number;
  feedback?: string;
}

export default function CommitteeApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/committee/applications');
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        console.error('Failed to fetch applications');
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลคำขอได้'
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลคำขอได้'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(app => app.pendingCommitteeReview);
      } else {
        filtered = filtered.filter(app => app.status === statusFilter);
      }
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (app: Application) => {
    if (app.pendingCommitteeReview) {
      if (app.currentApprovals >= app.requiredApprovals) {
        return <Badge className="bg-green-100 text-green-700">กรรมการอนุมัติแล้ว</Badge>;
      } else {
        return <Badge className="bg-orange-100 text-orange-700">
          รอกรรมการ ({app.currentApprovals}/{app.requiredApprovals})
        </Badge>;
      }
    }

    switch (app.status) {
      case 'รอตรวจสอบ':
        return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
      case 'อนุมัติแล้ว':
        return <Badge className="bg-green-100 text-green-700">อนุมัติแล้ว</Badge>;
      case 'ต้องแก้ไข':
        return <Badge className="bg-red-100 text-red-700">ต้องแก้ไข</Badge>;
      case 'เสร็จสิ้น':
        return <Badge className="bg-blue-100 text-blue-700">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="secondary">{app.status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'internship' ? 
      <Badge variant="outline" className="text-blue-600">ฝึกงาน</Badge> :
      <Badge variant="outline" className="text-green-600">สหกิจศึกษา</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คำขอของนักศึกษา</h1>
          <p className="text-gray-600">จัดการคำขอฝึกงานและสหกิจศึกษาของนักศึกษา</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            ทั้งหมด {filteredApplications.length} รายการ
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ค้นหา</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาด้วยชื่อ, อีเมล, บริษัท, หรือรหัสเอกสาร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">สถานะ</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="pending">รอกรรมการ</SelectItem>
                  <SelectItem value="รอตรวจสอบ">รอตรวจสอบ</SelectItem>
                  <SelectItem value="อนุมัติแล้ว">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="ต้องแก้ไข">ต้องแก้ไข</SelectItem>
                  <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ประเภท</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="internship">ฝึกงาน</SelectItem>
                  <SelectItem value="co_op">สหกิจศึกษา</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">การจัดการ</label>
              <Button 
                variant="outline" 
                onClick={fetchApplications}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                รีเฟรช
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            รายการคำขอ
          </CardTitle>
          <CardDescription>
            คลิกที่รายการเพื่อดูรายละเอียดและจัดการคำขอ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead className="font-semibold text-amber-700">รหัสเอกสาร</TableHead>
                    <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                    <TableHead className="font-semibold text-amber-700">สถานประกอบการ</TableHead>
                    <TableHead className="font-semibold text-amber-700">ตำแหน่ง</TableHead>
                    <TableHead className="font-semibold text-amber-700">ประเภท</TableHead>
                    <TableHead className="font-semibold text-amber-700">วันที่ยื่น</TableHead>
                    <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                    <TableHead className="font-semibold text-amber-700">กรรมการ</TableHead>
                    <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.studentName}</div>
                          <div className="text-sm text-gray-500">{app.studentEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{app.companyName}</TableCell>
                      <TableCell>{app.position || 'ไม่ระบุ'}</TableCell>
                      <TableCell>{getTypeBadge(app.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(app.dateApplied)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {app.currentApprovals}/{app.requiredApprovals}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/educator/committee/applications/${app.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

