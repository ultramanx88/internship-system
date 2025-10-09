'use client';

import { useState, useEffect, useCallback } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { EducatorRoleAssignmentForm } from '@/components/admin/educator-roles/EducatorRoleAssignmentForm';
import { useAuth } from '@/hooks/use-auth';

interface Educator {
  id: string;
  name: string;
  email: string;
  t_name?: string;
  t_surname?: string;
  e_name?: string;
  e_surname?: string;
}

interface AcademicYear {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

interface EducatorRoleAssignment {
  id: string;
  educatorId: string;
  academicYearId: string;
  semesterId: string;
  roles: string[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  educator: Educator;
  academicYear: AcademicYear;
  semester: Semester;
}

export default function EducatorRolesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<EducatorRoleAssignment[]>([]);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EducatorRoleAssignment | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch educators
  const fetchEducators = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch('/api/students?role=educators&limit=1000', {
        headers: { 'x-user-id': user.id }
      });
      if (response.ok) {
        const data = await response.json();
        setEducators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching educators:', error);
    }
  }, [user?.id]);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching academic years for user:', user.id);
      const response = await fetch('/api/academic-years', {
        headers: { 'x-user-id': user.id }
      });
      console.log('Academic years response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Academic years data received:', data);
        setAcademicYears(data.academicYears || data || []);
      } else {
        console.error('Failed to fetch academic years:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  }, [user?.id]);

  // Fetch semesters
  const fetchSemesters = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching semesters for user:', user.id);
      const response = await fetch('/api/semesters', {
        headers: { 'x-user-id': user.id }
      });
      console.log('Semesters response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Semesters data received:', data);
        setSemesters(data.semesters || data || []);
      } else {
        console.error('Failed to fetch semesters:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  }, [user?.id]);

  // Fetch academic years without authentication (fallback)
  const fetchAcademicYearsWithoutAuth = useCallback(async () => {
    try {
      console.log('Fetching academic years without auth...');
      const response = await fetch('/api/academic-years');
      console.log('Academic years (no auth) response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Academic years (no auth) data received:', data);
        setAcademicYears(data.academicYears || data || []);
      } else {
        console.error('Failed to fetch academic years without auth:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching academic years without auth:', error);
    }
  }, []);

  // Fetch semesters without authentication (fallback)
  const fetchSemestersWithoutAuth = useCallback(async () => {
    try {
      console.log('Fetching semesters without auth...');
      const response = await fetch('/api/semesters');
      console.log('Semesters (no auth) response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Semesters (no auth) data received:', data);
        setSemesters(data.semesters || data || []);
      } else {
        console.error('Failed to fetch semesters without auth:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching semesters without auth:', error);
    }
  }, []);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      const response = await fetch(`/api/educator-role-assignments?${params}`, {
        headers: { 'x-user-id': user.id }
      });
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถดึงข้อมูลได้'
        });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, toast, user?.id]);

  useEffect(() => {
    console.log('User ID:', user?.id);
    console.log('User object:', user);
    
    // Always try to fetch academic years and semesters
    fetchAcademicYearsWithoutAuth();
    fetchSemestersWithoutAuth();
    
    if (user?.id) {
      fetchEducators();
      // Also try with auth as backup
      fetchAcademicYears();
      fetchSemesters();
    }
  }, [fetchEducators, fetchAcademicYears, fetchSemesters, fetchAcademicYearsWithoutAuth, fetchSemestersWithoutAuth, user?.id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEditAssignment = (assignment: EducatorRoleAssignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบการกำหนดบทบาทนี้?')) return;

    try {
      const response = await fetch(`/api/educator-role-assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'ลบสำเร็จ',
          description: data.message
        });
        fetchAssignments();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถลบได้'
        });
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      educator: { label: 'อาจารย์', color: 'bg-indigo-100 text-indigo-800' },
      courseInstructor: { label: 'อาจารย์ประจำวิชา', color: 'bg-blue-100 text-blue-800' },
      supervisor: { label: 'อาจารย์นิเทศ', color: 'bg-green-100 text-green-800' },
      committee: { label: 'กรรมการ', color: 'bg-purple-100 text-purple-800' },
      visitor: { label: 'ผู้เยี่ยมชม', color: 'bg-gray-100 text-gray-800' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getEducatorName = (educator: Educator) => {
    if (educator.t_name && educator.t_surname) {
      return `${educator.t_name} ${educator.t_surname}`;
    }
    if (educator.e_name && educator.e_surname) {
      return `${educator.e_name} ${educator.e_surname}`;
    }
    return educator.name;
  };

  return (
    <PermissionGuard requiredRoles={['admin', 'staff']}>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">จัดการบทบาทบุคลากรทางการศึกษา</h1>
              <p className="text-gray-600">กำหนดบทบาทให้ educator ตามเทอมและปีการศึกษา</p>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>รายชื่อ Educator และการกำหนดบทบาท</CardTitle>
                    <CardDescription>
                      จัดการบทบาทของ educator ตามปีการศึกษาและภาคเรียน
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateAssignment} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มการกำหนดบทบาท
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ค้นหา Educator</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="ค้นหาตามชื่อ educator..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Assignments Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Educator</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">ปีการศึกษา</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">ภาคเรียน</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">บทบาท</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">สถานะ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">วันที่สร้าง</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            กำลังโหลดข้อมูล...
                          </td>
                        </tr>
                      ) : assignments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            ไม่พบข้อมูลการกำหนดบทบาท
                          </td>
                        </tr>
                      ) : (
                        assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {getEducatorName(assignment.educator)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {assignment.educator.email}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                {assignment.academicYear.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                                {assignment.semester.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {assignment.roles.length > 0 ? (
                                  <div>
                                    {getRoleBadge(assignment.roles[0])}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">ไม่ระบุบทบาท</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {assignment.isActive ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  ใช้งาน
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  ไม่ใช้งาน
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleDateString('th-TH')}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <EducatorRoleAssignmentForm
          assignment={editingAssignment}
          educators={educators}
          academicYears={academicYears}
          semesters={semesters}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingAssignment(null);
          }}
        />
      )}
      
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs">
          <div>Academic Years: {academicYears.length}</div>
          <div>Semesters: {semesters.length}</div>
          <div>Educators: {educators.length}</div>
        </div>
      )}
    </PermissionGuard>
  );
}
