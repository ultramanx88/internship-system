'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { 
  Search, 
  Filter, 
  Table as TableIcon, 
  Grid3X3, 
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';

interface CoopRequest {
  id: string;
  studentName: string;
  studentId: string;
  major: string;
  companyName: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  submittedDate: string;
}

interface ApiResponse {
  success: boolean;
  applications?: CoopRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  user?: {
    id: string;
    name: string;
    role: string;
  };
  error?: string;
}

export default function CoopRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { educatorRole, isLoading, error } = useEducatorRole();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<CoopRequest[]>([]);

  // ดึงข้อมูลจาก API
  const fetchRequests = async () => {
    console.log('fetchRequests called, user:', user);
    console.log('educatorRole:', educatorRole);
    
    // Development bypass check
    const isDev = process.env.NODE_ENV === 'development';
    const shouldBypass = isDev && (!user?.id || !educatorRole);
    
    if (!user?.id && !shouldBypass) {
      console.log('No user ID, skipping fetch');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedMajor && selectedMajor !== 'all') params.append('major', selectedMajor);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      console.log('Fetching with params:', params.toString());
      console.log('User ID being sent:', user?.id || 'dev-bypass');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add development bypass header if needed
      if (shouldBypass) {
        headers['x-dev-bypass'] = 'true';
        console.log('🔧 Using development bypass');
      } else if (user?.id) {
        headers['x-user-id'] = user.id;
      }
      
      const response = await fetch(`/api/educator/coop-requests?${params}`, {
        headers
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
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
      
      let data: ApiResponse;
      try {
        data = await response.json();
        console.log('API response:', data);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('ไม่สามารถอ่านข้อมูลจากเซิร์ฟเวอร์ได้');
      }

      if (data.success && data.applications && data.pagination) {
        setRequests(data.applications);
        setTotalPages(data.pagination!.totalPages);
      } else {
        const errorMessage = data.error || 'ไม่สามารถดึงข้อมูลได้';
        console.error('API returned error:', errorMessage);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component mount หรือ filter เปลี่ยน
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const shouldBypass = isDev && (!user?.id || !educatorRole);
    
    if (shouldBypass) {
      console.log('🔧 Development mode: Using bypass authentication');
      fetchRequests();
      return;
    }
    
    // สำหรับการทดสอบ ถ้าไม่มี user ให้ใช้ test user
    if (!user?.id) {
      console.log('No user found, using test user for demo');
      // ใช้ test user สำหรับการทดสอบ
      const testUser = { id: 'test_instructor_001' };
      fetchRequestsWithUser(testUser);
      return;
    }
    fetchRequests();
  }, [user?.id, currentPage, searchTerm, selectedMajor, selectedStatus]);

  // ฟังก์ชันสำหรับดึงข้อมูลด้วย user ที่กำหนด
  const fetchRequestsWithUser = async (testUser: { id: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: testUser.id,
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedMajor && selectedMajor !== 'all') params.append('major', selectedMajor);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      console.log('Fetching with test user params:', params.toString());
      const response = await fetch(`/api/educator/coop-requests?${params}`);
      const data: ApiResponse = await response.json();

      console.log('API response with test user:', data);

      if (data.success && data.applications && data.pagination) {
        setRequests(data.applications);
        setTotalPages(data.pagination!.totalPages);
      } else {
        const errorMessage = data.error || 'ไม่สามารถดึงข้อมูลได้';
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching requests with test user:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(requests.map(req => req.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleViewDetails = (applicationId: string) => {
    router.push(`/educator/coop-requests/${applicationId}`);
  };

  const handleApprove = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/educator/coop-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedItems,
          status: 'approved',
          feedback: 'อนุมัติแล้ว'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สำเร็จ',
          description: `อนุมัติ ${data.updatedCount} รายการแล้ว`,
        });
        setSelectedItems([]);
        fetchRequests(); // ดึงข้อมูลใหม่
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถอนุมัติได้',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error approving requests:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">รอผล</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">อนุมัติ</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">ไม่อนุมัติ</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบ</Badge>;
    }
  };

  // ใช้ข้อมูลจาก API โดยตรง (ไม่ต้อง filter อีกครั้งเพราะ API ทำแล้ว)
  const filteredRequests = requests;

  // Development bypass - skip auth checks in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  const shouldBypass = isDev && (!user?.id || !educatorRole);

  // แสดง loading state (skip in dev bypass mode)
  if (isLoading && !shouldBypass) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // แสดง error state (skip in dev bypass mode)
  if (error && !shouldBypass) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 text-destructive mx-auto mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // แสดง loading state เฉพาะเมื่อกำลังโหลดข้อมูล
  if (loading && requests.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Development Mode Indicator */}
      {shouldBypass && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-2">🔧</div>
            <div>
              <strong>Development Mode:</strong> Authentication bypass is active. 
              This will only work in development environment.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">รายการขอฝึกงาน / สหกิจศึกษา</h1>
        <p className="text-muted-foreground">
          จัดการคำขอฝึกงานและสหกิจศึกษาของนักศึกษา
        </p>
      </div>

      {/* Search Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-amber-700">ค้นหา</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">ค้นหา</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ชื่อนักศึกษา, รหัสประจำตัว"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="major" className="text-sm font-medium text-gray-700">สาขาวิชา</Label>
              <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="it">เทคโนโลยีสารสนเทศ</SelectItem>
                  <SelectItem value="cs">วิทยาการคอมพิวเตอร์</SelectItem>
                  <SelectItem value="se">วิศวกรรมซอฟต์แวร์</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">สถานะ</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="กรุณาเลือก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="pending">รอผล</SelectItem>
                    <SelectItem value="approved">อนุมัติ</SelectItem>
                    <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" className="mb-1">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-amber-700">
              รายชื่อ ({filteredRequests.length} รายการ)
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 w-8 p-0"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                onClick={handleApprove}
                disabled={selectedItems.length === 0 || loading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                อนุมัติ ({selectedItems.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead className="font-semibold text-amber-700 w-12">
                      <Checkbox
                        checked={selectedItems.length === requests.length && requests.length > 0}
                        onCheckedChange={handleSelectAll}
                        disabled={loading}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                    <TableHead className="font-semibold text-amber-700">สาขาวิชา</TableHead>
                    <TableHead className="font-semibold text-amber-700">สถานประกอบการ</TableHead>
                    <TableHead className="font-semibold text-amber-700">ตำแหน่ง</TableHead>
                    <TableHead className="font-semibold text-amber-700">วันที่ยื่น</TableHead>
                    <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                    <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        ไม่พบข้อมูล
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(request.id)}
                            onCheckedChange={(checked) => handleSelectItem(request.id, checked as boolean)}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.studentName}</p>
                            <p className="text-sm text-gray-500">{request.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.major}</TableCell>
                        <TableCell>{request.companyName}</TableCell>
                        <TableCell>{request.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {request.submittedDate}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                   <TableCell>
                                     <div className="flex items-center justify-center gap-1">
                                       <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-8 w-8 p-0 hover:bg-blue-50" 
                                         disabled={loading}
                                         onClick={() => handleViewDetails(request.id)}
                                         title="ดูรายละเอียด"
                                       >
                                         <Eye className="h-4 w-4" />
                                       </Button>
                                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={loading}>
                                         <Edit className="h-4 w-4" />
                                       </Button>
                                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" disabled={loading}>
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </div>
                                   </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <Checkbox
                      checked={selectedItems.includes(request.id)}
                      onCheckedChange={(checked) => handleSelectItem(request.id, checked as boolean)}
                    />
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium">{request.studentName}</h3>
                      <p className="text-sm text-gray-500">{request.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">สาขา: {request.major}</p>
                      <p className="text-sm text-gray-600">บริษัท: {request.companyName}</p>
                      <p className="text-sm text-gray-600">ตำแหน่ง: {request.position}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {request.submittedDate}
                    </div>
                  </div>
                             <div className="flex items-center gap-1 mt-4">
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 className="flex-1"
                                 onClick={() => handleViewDetails(request.id)}
                               >
                                 <Eye className="h-4 w-4 mr-1" />
                                 ดู
                               </Button>
                               <Button variant="outline" size="sm" className="flex-1">
                                 <Edit className="h-4 w-4 mr-1" />
                                 แก้ไข
                               </Button>
                             </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 font-medium">
              หน้า {currentPage}/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
