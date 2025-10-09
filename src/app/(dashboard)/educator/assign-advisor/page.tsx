'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserMultiSelect from '@/components/ui/UserMultiSelect';
import { useAuth } from '@/hooks/use-auth';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building, Calendar, Mail, Phone, GraduationCap, MapPin, Clock, Check, Trash2, ChevronLeft, ChevronRight, Search, Filter, Grid3X3, List, Users, Eye, X, Edit } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  major: string;
  companyName: string;
  position: string;
  status: string;
  createdAt: string;
  submittedDate: string;
  supervisor?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AssignAdvisorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isEducator } = useEducatorRole();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [updatingSupervisor, setUpdatingSupervisor] = useState(false);
  const [committees, setCommittees] = useState<any[]>([]);
  const [selectedCommitteeIds, setSelectedCommitteeIds] = useState<string[]>([]);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [assigningCommittee, setAssigningCommittee] = useState(false);
  
  // Filters
  const [companySearch, setCompanySearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const itemsPerPage = 5;

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const shouldBypass = isDev && (!user?.id);
    
    if (shouldBypass) {
      console.log('🔧 Development mode: Using bypass authentication for assign-advisor');
      loadApplications();
      return;
    }
    
    if (user?.id) {
      loadApplications();
    } else if (isDev) {
      // In development mode, try to load even without user
      console.log('🔧 Development mode: No user but trying to load applications');
      loadApplications();
    }
  }, [user?.id, currentPage]);

  const loadApplications = async () => {
    // Development bypass check
    const isDev = process.env.NODE_ENV === 'development';
    const shouldBypass = isDev && (!user?.id);
    
    if (!user?.id && !shouldBypass) {
      console.log('No user ID, skipping loadApplications');
      return;
    }

    try {
      setLoading(true);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add development bypass header if needed
      if (shouldBypass) {
        headers['x-dev-bypass'] = 'true';
        console.log('🔧 Using development bypass for assign-advisor');
      } else if (user?.id) {
        headers['x-user-id'] = user.id;
      }
      
      const response = await fetch(`/api/educator/coop-requests?page=${currentPage}&limit=${itemsPerPage}&status=approved`, {
        headers
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('API returned error:', data.error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถโหลดข้อมูลได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleRemoveApplication = (applicationId: string) => {
    setSelectedApplications(prev => prev.filter(id => id !== applicationId));
  };

  const handleEditSupervisor = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setEditingApplication(application);
    setSelectedSupervisorId(application.supervisor?.id || '');
    setShowEditModal(true);

    // โหลดรายชื่ออาจารย์นิเทศ
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/educator/supervisors`, {
        headers: {
          'x-user-id': user.id,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to load supervisors:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setSupervisors(data.supervisors);
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
    }
  };

  const handleUpdateSupervisor = async () => {
    if (!editingApplication || !selectedSupervisorId) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเลือกอาจารย์นิเทศ',
        variant: 'destructive'
      });
      return;
    }

    setUpdatingSupervisor(true);
    try {
      const response = await fetch(`/api/educator/applications/${editingApplication.id}/update-supervisor`, {
        method: 'PUT',
        headers: {
          'x-user-id': user?.id || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ supervisorId: selectedSupervisorId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: data.message,
        });
        
        // อัปเดตข้อมูลในตาราง
        setApplications(prev => prev.map(app => 
          app.id === editingApplication.id 
            ? { 
                ...app, 
                supervisor: data.application.supervisor 
              } 
            : app
        ));
        
        setShowEditModal(false);
        setEditingApplication(null);
        setSelectedSupervisorId('');
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถอัปเดตอาจารย์นิเทศได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating supervisor:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'มีข้อผิดพลาดในการอัปเดตอาจารย์นิเทศ',
        variant: 'destructive'
      });
    } finally {
      setUpdatingSupervisor(false);
    }
  };

  const handleAssignCommittee = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setEditingApplication(application);
    setSelectedCommitteeIds([]);
    setShowCommitteeModal(true);

    // โหลดรายชื่อกรรมการ
    try {
      const response = await fetch('/api/committees?includeMembers=true');
      const data = await response.json();
      if (data.success) {
        setCommittees(data.committees);
      }
    } catch (error) {
      console.error('Error loading committees:', error);
    }
  };

  const handleUpdateCommittee = async () => {
    if (!editingApplication || selectedCommitteeIds.length === 0) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเลือกกรรมการอย่างน้อย 1 ท่าน',
        variant: 'destructive'
      });
      return;
    }

    setAssigningCommittee(true);
    try {
      const response = await fetch(`/api/educator/applications/${editingApplication.id}/assign-committee`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          committeeIds: selectedCommitteeIds,
          assignedBy: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: data.message,
        });
        
        setShowCommitteeModal(false);
        setEditingApplication(null);
        setSelectedCommitteeIds([]);
        
        // โหลดข้อมูลใหม่
        loadApplications();
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถมอบหมายกรรมการได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error assigning committee:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'มีข้อผิดพลาดในการมอบหมายกรรมการ',
        variant: 'destructive'
      });
    } finally {
      setAssigningCommittee(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (selectedApplications.length === 0) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเลือกการฝึกงานที่ต้องการมอบหมายอาจารย์นิเทศ',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/educator/applications/bulk-approve', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: `พร้อมสำหรับมอบหมายอาจารย์นิเทศ ${selectedApplications.length} รายการแล้ว`,
        });
        setShowModal(false);
        setSelectedApplications([]);
        loadApplications();
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถดำเนินการได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error processing supervisor assignment:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถดำเนินการได้',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedApplicationsData = applications.filter(app => selectedApplications.includes(app.id));

  // Development bypass - skip auth checks in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  const shouldBypass = isDev && (!user?.id);

  if (loading && !shouldBypass) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Development Mode Indicator */}
            {shouldBypass && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-yellow-500 mr-2">🔧</div>
                  <div>
                    <strong>Development Mode:</strong> Authentication bypass is active for assign-advisor page. 
                    This will only work in development environment.
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/educator/coop-requests">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">มอบหมายอาจารย์นิเทศ</h1>
                <p className="text-gray-600">เลือกการฝึกงานที่ต้องการมอบหมายอาจารย์นิเทศ</p>
              </div>
            </div>

            {/* Search Sections */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* ค้นหาด้วยรายชื่อบริษัท */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ค้นหาด้วยรายชื่อบริษัท</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ค้นหา</label>
                    <Input
                      placeholder="ชื่อบริษัท"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
                      <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="กรุณาเลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="developer">นักพัฒนาซอฟต์แวร์</SelectItem>
                          <SelectItem value="designer">นักออกแบบ</SelectItem>
                          <SelectItem value="marketing">การตลาด</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700">จังหวัด</label>
                      <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="กรุณาเลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="bangkok">กรุงเทพฯ</SelectItem>
                          <SelectItem value="chiangmai">เชียงใหม่</SelectItem>
                          <SelectItem value="phuket">ภูเก็ต</SelectItem>
                        </SelectContent>
                      </Select>
                      <Filter className="h-4 w-4 text-gray-400 absolute right-3 top-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ค้นหาด้วยรายชื่อนักศึกษา */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ค้นหาด้วยรายชื่อนักศึกษา</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ค้นหา</label>
                    <Input
                      placeholder="ชื่อนักศึกษา, รหัสประจำตัว"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">สาขาวิชา</label>
                      <Select value={majorFilter} onValueChange={setMajorFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="กรุณาเลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="cs">วิทยาการคอมพิวเตอร์</SelectItem>
                          <SelectItem value="it">เทคโนโลยีสารสนเทศ</SelectItem>
                          <SelectItem value="se">วิศวกรรมซอฟต์แวร์</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700">วันที่ส่ง</label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="กรุณาเลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="today">วันนี้</SelectItem>
                          <SelectItem value="week">สัปดาห์นี้</SelectItem>
                          <SelectItem value="month">เดือนนี้</SelectItem>
                        </SelectContent>
                      </Select>
                      <Filter className="h-4 w-4 text-gray-400 absolute right-3 top-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* รายชื่อ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">รายชื่อ</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-amber-50 border-amber-200">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => setShowModal(true)}
                      disabled={selectedApplications.length === 0}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      กำหนดอาจารย์นิเทศ ({selectedApplications.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-amber-600 text-white">
                        <th className="px-4 py-3 text-left">
                          <Checkbox />
                        </th>
                        <th className="px-4 py-3 text-left">ชื่อนักศึกษา</th>
                        <th className="px-4 py-3 text-left">รหัสนักศึกษา</th>
                        <th className="px-4 py-3 text-left">สาขาวิชา</th>
                        <th className="px-4 py-3 text-left">ชื่อบริษัท</th>
                        <th className="px-4 py-3 text-left">ตำแหน่งงาน</th>
                        <th className="px-4 py-3 text-left">อาจารย์นิเทศ</th>
                        <th className="px-4 py-3 text-left">ข้อมูลเพิ่มเติม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application, index) => (
                        <tr key={application.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedApplications.includes(application.id)}
                              onCheckedChange={() => handleSelectApplication(application.id)}
                            />
                          </td>
                          <td className="px-4 py-3">{application.studentName || 'ไม่ระบุ'}</td>
                          <td className="px-4 py-3">{application.studentId || 'ไม่ระบุ'}</td>
                          <td className="px-4 py-3">{application.major || 'ไม่ระบุ'}</td>
                          <td className="px-4 py-3">{application.companyName || 'ไม่ระบุ'}</td>
                          <td className="px-4 py-3">{application.position || 'ไม่ระบุ'}</td>
                          <td className="px-4 py-3">
                            {application.supervisor ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  กำหนดแล้ว
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleEditSupervisor(application.id)}
                                >
                                  แก้ไข
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                ยังไม่กำหนด
                              </Badge>
                            )}
                          </td>
                     <td className="px-4 py-3">
                       <div className="flex gap-2">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="text-amber-600 hover:text-amber-700"
                           onClick={() => handleAssignCommittee(application.id)}
                         >
                           <Users className="h-4 w-4" />
                         </Button>
                         <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                           <Eye className="h-4 w-4" />
                         </Button>
                       </div>
                     </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    หน้า {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">รายชื่อที่เลือก</h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowModal(false)}
                  className="text-red-600 hover:text-red-700"
                >
                  ×
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-amber-600 text-white">
                      <th className="px-4 py-3 text-left">ชื่อนักศึกษา</th>
                      <th className="px-4 py-3 text-left">ชื่อบริษัท</th>
                      <th className="px-4 py-3 text-left">ตำแหน่งงาน</th>
                      <th className="px-4 py-3 text-left">แก้ไข</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApplicationsData.map((application) => (
                      <tr key={application.id} className="border-b">
                        <td className="px-4 py-3">{application.studentName}</td>
                        <td className="px-4 py-3">{application.companyName}</td>
                        <td className="px-4 py-3">{application.position}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveApplication(application.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination in Modal */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  หน้า 1 / 1
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleConfirmApproval}
                  disabled={submitting || selectedApplications.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันการมอบหมายอาจารย์นิเทศ'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Supervisor Modal */}
        {showEditModal && editingApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingApplication(null);
                  setSelectedSupervisorId('');
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">แก้ไขอาจารย์นิเทศ</h2>
                <p className="text-gray-600">สำหรับนักศึกษา: <span className="font-medium text-amber-600">{editingApplication.studentName}</span></p>
              </div>

                <div className="space-y-4">
                {/* ข้อมูลนักศึกษา */}
                <Card className="border-l-4 border-amber-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-600" />
                      ข้อมูลนักศึกษา
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">ชื่อ-นามสกุล:</span>
                        <p className="font-medium">{editingApplication.studentName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">รหัสนักศึกษา:</span>
                        <p className="font-medium">{editingApplication.studentId}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">สาขาวิชา:</span>
                        <p className="font-medium">{editingApplication.major}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">บริษัท:</span>
                        <p className="font-medium">{editingApplication.companyName}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">ตำแหน่งงาน:</span>
                        <p className="font-medium">{editingApplication.position}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* เลือกอาจารย์นิเทศ */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">อาจารย์นิเทศปัจจุบัน</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {editingApplication.supervisor ? (
                      <>
                        <User className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{editingApplication.supervisor.name}</span>
                        <span className="text-sm text-gray-500">({editingApplication.supervisor.email})</span>
                      </>
                    ) : (
                      <span className="text-gray-500">ยังไม่ได้กำหนด</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">เปลี่ยนเป็นอาจารย์นิเทศ</label>
                  <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกอาจารย์นิเทศ" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map(supervisor => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{supervisor.name}</span>
                            <span className="text-sm text-gray-500">{supervisor.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ปุ่มดำเนินการ */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateSupervisor}
                    disabled={updatingSupervisor || !selectedSupervisorId}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                  >
                    {updatingSupervisor ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังอัปเดต...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        อัปเดตอาจารย์นิเทศ
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingApplication(null);
                      setSelectedSupervisorId('');
                    }}
                    className="px-6"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Committee Assignment Modal */}
        {showCommitteeModal && editingApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowCommitteeModal(false);
                  setEditingApplication(null);
                  setSelectedCommitteeIds([]);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">มอบหมายกรรมการ</h2>
                <p className="text-gray-600">สำหรับนักศึกษา: <span className="font-medium text-amber-600">{editingApplication.studentName}</span></p>
              </div>

              <div className="space-y-4">
                {/* ข้อมูลนักศึกษา */}
                <Card className="border-l-4 border-amber-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-600" />
                      ข้อมูลนักศึกษา
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">ชื่อ-นามสกุล:</span>
                        <p className="font-medium">{editingApplication.studentName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">รหัสนักศึกษา:</span>
                        <p className="font-medium">{editingApplication.studentId}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">สาขาวิชา:</span>
                        <p className="font-medium">{editingApplication.major}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">บริษัท:</span>
                        <p className="font-medium">{editingApplication.companyName}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">ตำแหน่งงาน:</span>
                        <p className="font-medium">{editingApplication.position}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* เลือกกรรมการ */}
                <div className="space-y-4">
                  <div>
                    <UserMultiSelect
                      label="เลือกกรรมการ (สามารถเลือกได้ 1-6 ท่าน)"
                      roles={["committee"]}
                      values={selectedCommitteeIds}
                      onChange={setSelectedCommitteeIds}
                      maxSelected={6}
                      sort="new"
                    />
                  </div>
                </div>

                {/* ปุ่มดำเนินการ */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateCommittee}
                    disabled={assigningCommittee || selectedCommitteeIds.length === 0}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                  >
                    {assigningCommittee ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังมอบหมาย...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        มอบหมายกรรมการ ({selectedCommitteeIds.length} ท่าน)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCommitteeModal(false);
                      setEditingApplication(null);
                      setSelectedCommitteeIds([]);
                    }}
                    className="px-6"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
