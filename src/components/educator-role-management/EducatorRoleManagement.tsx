'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Users, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  Loader2,
  Download,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  EducatorRoleAssignment,
  Educator,
  AcademicYear,
  Semester,
  RoleOption,
  AssignmentFilters,
  PaginationParams,
  EducatorRoleManagementProps
} from '@/lib/educator-role-management';
import { EducatorRoleAssignmentManager } from '@/lib/educator-role-management/role-assignment-manager';
import { createEmptyFilters, createEmptyPagination } from '@/lib/educator-role-management/utils';
import { EducatorRoleAssignmentForm } from './EducatorRoleAssignmentForm';
import { EducatorRoleTable } from './EducatorRoleTable';

export function EducatorRoleManagement({
  assignments: initialAssignments = [],
  educators: initialEducators = [],
  academicYears: initialAcademicYears = [],
  semesters: initialSemesters = [],
  config,
  onAssignmentCreate,
  onAssignmentUpdate,
  onAssignmentDelete,
  onError,
  className,
  readOnly = false,
  showCreateButton = true,
  showEditButton = true,
  showDeleteButton = true
}: EducatorRoleManagementProps) {
  const { toast } = useToast();
  
  // State
  const [assignments, setAssignments] = useState<EducatorRoleAssignment[]>(initialAssignments);
  const [educators, setEducators] = useState<Educator[]>(initialEducators);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(initialAcademicYears);
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<AssignmentFilters>(createEmptyFilters());
  const [pagination, setPagination] = useState<PaginationParams>(createEmptyPagination());
  
  const [selectedAssignment, setSelectedAssignment] = useState<EducatorRoleAssignment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Initialize manager
  const manager = new EducatorRoleAssignmentManager();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await manager.loadAllData();
      const data = manager.getCurrentData();

      setAssignments(data.assignments);
      setEducators(data.educators);
      setAcademicYears(data.academicYears);
      setSemesters(data.semesters);
      setRoleOptions(data.roleOptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (data: any) => {
    try {
      const newAssignment = await manager.createAssignment(data);
      setAssignments(prev => [newAssignment, ...prev]);
      onAssignmentCreate?.(newAssignment);
      
      toast({
        title: 'สร้างสำเร็จ',
        description: 'การกำหนดบทบาทสร้างเรียบร้อยแล้ว'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้าง';
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage
      });
      onError?.(errorMessage);
    }
  };

  const handleUpdateAssignment = async (data: any) => {
    try {
      const updatedAssignment = await manager.updateAssignment(data);
      setAssignments(prev => 
        prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a)
      );
      onAssignmentUpdate?.(updatedAssignment);
      
      toast({
        title: 'อัปเดตสำเร็จ',
        description: 'การกำหนดบทบาทอัปเดตเรียบร้อยแล้ว'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดต';
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage
      });
      onError?.(errorMessage);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await manager.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      onAssignmentDelete?.(id);
      
      toast({
        title: 'ลบสำเร็จ',
        description: 'การกำหนดบทบาทลบเรียบร้อยแล้ว'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ';
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage
      });
      onError?.(errorMessage);
    }
  };

  const handleFiltersChange = (newFilters: Partial<AssignmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePaginationChange = (newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const handleOpenForm = (assignment?: EducatorRoleAssignment) => {
    setSelectedAssignment(assignment || null);
    setIsEditing(!!assignment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAssignment(null);
    setIsEditing(false);
  };

  const handleFormSuccess = (assignment: EducatorRoleAssignment) => {
    if (isEditing) {
      handleUpdateAssignment(assignment);
    } else {
      handleCreateAssignment(assignment);
    }
    handleCloseForm();
  };

  const handleExport = async () => {
    try {
      // Implement export functionality
      toast({
        title: 'ส่งออกสำเร็จ',
        description: 'ไฟล์รายงานถูกส่งออกเรียบร้อยแล้ว'
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออกรายงานได้'
      });
    }
  };

  // Filter and sort assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filters.academicYearId && assignment.academicYearId !== filters.academicYearId) {
      return false;
    }
    if (filters.semesterId && assignment.semesterId !== filters.semesterId) {
      return false;
    }
    if (filters.educatorId && assignment.educatorId !== filters.educatorId) {
      return false;
    }
    if (filters.role && !assignment.roles.includes(filters.role)) {
      return false;
    }
    if (filters.isActive !== undefined && assignment.isActive !== filters.isActive) {
      return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const educatorName = assignment.educator.name.toLowerCase();
      const academicYearName = assignment.academicYear.name.toLowerCase();
      const semesterName = assignment.semester.name.toLowerCase();
      const rolesText = assignment.roles.join(' ').toLowerCase();
      
      if (!educatorName.includes(searchTerm) &&
          !academicYearName.includes(searchTerm) &&
          !semesterName.includes(searchTerm) &&
          !rolesText.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const field = pagination.sortBy;
    const order = pagination.sortOrder;
    
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'educator.name':
        aValue = a.educator.name;
        bValue = b.educator.name;
        break;
      case 'academicYear.year':
        aValue = a.academicYear.year;
        bValue = b.academicYear.year;
        break;
      case 'semester.name':
        aValue = a.semester.name;
        bValue = b.semester.name;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        aValue = a[field as keyof EducatorRoleAssignment];
        bValue = b[field as keyof EducatorRoleAssignment];
    }

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Statistics
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.isActive).length,
    inactive: assignments.filter(a => !a.isActive).length,
    byRole: roleOptions.reduce((acc, role) => {
      acc[role.value] = assignments.filter(a => a.roles.includes(role.value)).length;
      return acc;
    }, {} as Record<string, number>)
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการบทบาท Educator</h2>
          <p className="text-gray-600">กำหนดบทบาทให้ Educator ตามปีการศึกษาและภาคเรียน</p>
        </div>
        {showCreateButton && !readOnly && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มการกำหนดบทบาท
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ใช้งาน</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ไม่ใช้งาน</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">บทบาท</p>
                <p className="text-2xl font-bold text-purple-600">{roleOptions.length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการการกำหนดบทบาท</CardTitle>
          <CardDescription>
            จำนวน {sortedAssignments.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EducatorRoleTable
            assignments={sortedAssignments}
            loading={loading}
            filters={filters}
            pagination={pagination}
            onFiltersChange={handleFiltersChange}
            onPaginationChange={handlePaginationChange}
            onEdit={readOnly || !showEditButton ? () => {} : handleOpenForm}
            onDelete={readOnly || !showDeleteButton ? () => {} : handleDeleteAssignment}
            onView={(assignment) => setSelectedAssignment(assignment)}
            onExport={handleExport}
            selectedAssignments={selectedAssignments}
            onSelectionChange={setSelectedAssignments}
            showActions={!readOnly}
            showSelection={!readOnly}
            showPagination={true}
            showFilters={true}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {isFormOpen && (
        <EducatorRoleAssignmentForm
          assignment={selectedAssignment}
          educators={educators}
          academicYears={academicYears}
          semesters={semesters}
          roleOptions={roleOptions}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
          isLoading={loading}
        />
      )}
    </div>
  );
}
