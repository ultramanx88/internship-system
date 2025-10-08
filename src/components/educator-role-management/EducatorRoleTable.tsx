'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  EducatorRoleAssignment,
  AssignmentFilters,
  PaginationParams
} from '@/lib/educator-role-management';
import { getEducatorDisplayName, getRoleDisplayName } from '@/lib/educator-role-management/utils';

interface EducatorRoleTableProps {
  assignments: EducatorRoleAssignment[];
  loading?: boolean;
  filters: AssignmentFilters;
  pagination: PaginationParams;
  onFiltersChange: (filters: Partial<AssignmentFilters>) => void;
  onPaginationChange: (pagination: Partial<PaginationParams>) => void;
  onEdit: (assignment: EducatorRoleAssignment) => void;
  onDelete: (id: string) => void;
  onView: (assignment: EducatorRoleAssignment) => void;
  onExport?: () => void;
  selectedAssignments?: string[];
  onSelectionChange?: (selected: string[]) => void;
  showActions?: boolean;
  showSelection?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
}

export function EducatorRoleTable({
  assignments,
  loading = false,
  filters,
  pagination,
  onFiltersChange,
  onPaginationChange,
  onEdit,
  onDelete,
  onView,
  onExport,
  selectedAssignments = [],
  onSelectionChange,
  showActions = true,
  showSelection = false,
  showPagination = true,
  showFilters = true
}: EducatorRoleTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value });
  };

  const handleSelectAll = () => {
    if (selectedAssignments.length === assignments.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(assignments.map(a => a.id));
    }
  };

  const handleSelectAssignment = (id: string) => {
    if (selectedAssignments.includes(id)) {
      onSelectionChange?.(selectedAssignments.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange?.([...selectedAssignments, id]);
    }
  };

  const handleSort = (field: string) => {
    const newOrder = pagination.sortBy === field && pagination.sortOrder === 'asc' ? 'desc' : 'asc';
    onPaginationChange({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (page: number) => {
    onPaginationChange({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    onPaginationChange({ page: 1, limit });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
      </Badge>
    );
  };

  const getRolesBadges = (roles: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map(role => (
          <Badge key={role} variant="outline" className="text-xs">
            {getRoleDisplayName(role)}
          </Badge>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(assignments.length / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedAssignments = assignments.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาด้วยชื่อ Educator, ปีการศึกษา, ภาคเรียน..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.isActive?.toString() || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                isActive: value === 'all' ? undefined : value === 'true' 
              })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="true">ใช้งาน</SelectItem>
              <SelectItem value="false">ไม่ใช้งาน</SelectItem>
            </SelectContent>
          </Select>
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAssignments.length === assignments.length && assignments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('educator.name')}
              >
                Educator
                {pagination.sortBy === 'educator.name' && (
                  <span className="ml-1">
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('academicYear.year')}
              >
                ปีการศึกษา
                {pagination.sortBy === 'academicYear.year' && (
                  <span className="ml-1">
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('semester.name')}
              >
                ภาคเรียน
                {pagination.sortBy === 'semester.name' && (
                  <span className="ml-1">
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('isActive')}
              >
                สถานะ
                {pagination.sortBy === 'isActive' && (
                  <span className="ml-1">
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                วันที่สร้าง
                {pagination.sortBy === 'createdAt' && (
                  <span className="ml-1">
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              {showActions && <TableHead className="w-12">การดำเนินการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูลการกำหนดบทบาท'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-gray-50">
                  {showSelection && (
                    <TableCell>
                      <Checkbox
                        checked={selectedAssignments.includes(assignment.id)}
                        onCheckedChange={() => handleSelectAssignment(assignment.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {getEducatorDisplayName(assignment.educator)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.educator.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{assignment.academicYear.name}</div>
                    <div className="text-sm text-gray-500">
                      ปี {assignment.academicYear.year}
                    </div>
                  </TableCell>
                  <TableCell>{assignment.semester.name}</TableCell>
                  <TableCell>{getRolesBadges(assignment.roles)}</TableCell>
                  <TableCell>{getStatusBadge(assignment.isActive)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(assignment.createdAt)}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(assignment)}>
                            <Eye className="h-4 w-4 mr-2" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(assignment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(assignment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            แสดง {startIndex + 1} - {Math.min(endIndex, assignments.length)} จาก {assignments.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-sm">
                {pagination.page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
