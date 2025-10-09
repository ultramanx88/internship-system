'use client';

import { useState, useMemo } from 'react';
import { applications as mockApplications, users as mockUsers, internships as mockInternships } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateScheduleForm } from '@/components/admin/schedules/CreateScheduleForm';

type ScheduleData = {
    id: string;
    studentName: string;
    studentId: string;
    companyName: string;
    teacherName: string;
    visitDate: string;
    scheduleStatus: string;
};

export default function AdminSchedulesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<'studentName' | 'companyName' | 'teacherName' | 'visitDate'>('studentName');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const scheduleData: ScheduleData[] = useMemo(() => {
        // Mock data for schedules - combining applications, users, and internships
        return mockApplications
            .filter(app => app.status === 'approved') // Only show schedules for approved applications
            .map(app => {
                const student = mockUsers.find(u => u.id === app.studentId);
                const internship = mockInternships.find(i => i.id === app.internshipId);
                const teacher = mockUsers.find(u => u.roles.includes('visitor')); // Assign a mock visitor
                return {
                    ...app,
                    studentName: student?.name || 'N/A',
                    studentId: student?.id || 'N/A',
                    companyName: internship?.companyId || 'N/A',
                    teacherName: teacher?.name || 'ยังไม่ได้มอบหมาย',
                    visitDate: 'ยังไม่ได้นัดหมาย', // Mock data for visit date
                    scheduleStatus: teacher ? 'รอนัดหมาย' : 'ยังไม่มอบหมาย',
                };
            });
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let filtered = scheduleData.filter(item => {
            const matchesSearch =
                item.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.studentId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.companyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.teacherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || item.scheduleStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [scheduleData, debouncedSearchTerm, statusFilter, sortField, sortOrder]);

    // Apply pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAndSortedData.slice(startIndex, endIndex);
    }, [filteredAndSortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
    const totalItems = filteredAndSortedData.length;

    const handleCreateSuccess = () => {
        setIsCreateDialogOpen(false);
        // Here you would typically refetch the data
    };

    const handleEditSuccess = () => {
        setIsEditDialogOpen(false);
        setEditingSchedule(null);
        // Here you would typically refetch the data
    };

    const openEditDialog = (schedule: ScheduleData) => {
        setEditingSchedule(schedule);
        setIsEditDialogOpen(true);
    };

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: typeof sortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">นัดหมายนิเทศ</h1>
                <p>จัดการและมอบหมายตารางการนิเทศสำหรับนักเรียนและอาจารย์</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>ตารางการนัดหมายทั้งหมด</CardTitle>
                    <CardDescription>ค้นหาและกรองการนัดหมาย</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อ, บริษัท, อาจารย์..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="สถานะทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                                <SelectItem value="รอนัดหมาย">รอนัดหมาย</SelectItem>
                                <SelectItem value="นัดหมายแล้ว">นัดหมายแล้ว</SelectItem>
                                <SelectItem value="ยังไม่มอบหมาย">ยังไม่มอบหมาย</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">เรียงตาม:</span>
                            <Select value={sortField} onValueChange={(value) => setSortField(value as typeof sortField)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="studentName">ชื่อนักศึกษา</SelectItem>
                                    <SelectItem value="companyName">บริษัท</SelectItem>
                                    <SelectItem value="teacherName">อาจารย์</SelectItem>
                                    <SelectItem value="visitDate">วันที่นัดหมาย</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="flex items-center gap-1"
                            >
                                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                {sortOrder === 'asc' ? 'น้อย→มาก' : 'มาก→น้อย'}
                            </Button>
                        </div>
                         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="ml-auto">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    สร้างนัดหมายใหม่
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader>
                                    <DialogTitle>สร้างนัดหมายการนิเทศ</DialogTitle>
                                    <DialogDescription>
                                        เลือกนักศึกษา, อาจารย์ และกำหนดวันที่สำหรับการนิเทศ
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateScheduleForm 
                                    onSuccess={handleCreateSuccess}
                                    onCancel={() => setIsCreateDialogOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-600 hover:bg-primary-600">
                                    <TableHead 
                                        className="text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('studentName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            ชื่อ-สกุล
                                            {getSortIcon('studentName')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('companyName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            บริษัท
                                            {getSortIcon('companyName')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('teacherName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            อาจารย์นิเทศก์
                                            {getSortIcon('teacherName')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('visitDate')}
                                    >
                                        <div className="flex items-center gap-1">
                                            วันที่นัดหมาย
                                            {getSortIcon('visitDate')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-white">สถานะ</TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.studentName}</TableCell>
                                            <TableCell>{item.companyName}</TableCell>
                                            <TableCell>{item.teacherName}</TableCell>
                                            <TableCell>{item.visitDate}</TableCell>
                                            <TableCell className="text-center">
                                                 <Badge variant={
                                                     item.scheduleStatus === 'นัดหมายแล้ว' ? 'default' :
                                                     item.scheduleStatus === 'รอนัดหมาย' ? 'secondary' : 'destructive'
                                                 } className="capitalize">
                                                    {item.scheduleStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                                                    จัดการ
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    แสดง {((currentPage - 1) * pageSize) + 1} ถึง {Math.min(currentPage * pageSize, totalItems)} จาก {totalItems} รายการ
                                </p>
                                <Select value={pageSize.toString()} onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setCurrentPage(1); // Reset to first page when changing page size
                                }}>
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">รายการต่อหน้า</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    หน้าแรก
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    ก่อนหน้า
                                </Button>
                                
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-muted-foreground">หน้า</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => {
                                            const page = Number(e.target.value);
                                            if (page >= 1 && page <= totalPages) {
                                                setCurrentPage(page);
                                            }
                                        }}
                                        className="h-8 w-16 text-center"
                                    />
                                    <span className="text-sm text-muted-foreground">จาก {totalPages}</span>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    ถัดไป
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    หน้าสุดท้าย
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>จัดการนัดหมายการนิเทศ</DialogTitle>
                                <DialogDescription>
                                    อัปเดตข้อมูลสำหรับ: {editingSchedule?.studentName}
                                </DialogDescription>
                            </DialogHeader>
                            <CreateScheduleForm 
                                onSuccess={handleEditSuccess}
                                onCancel={() => setIsEditDialogOpen(false)}
                                schedule={editingSchedule}
                            />
                        </DialogContent>
                    </Dialog>

                </CardContent>
            </Card>
        </div>
    );
}
