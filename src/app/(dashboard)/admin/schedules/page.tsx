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
import { Calendar, Search } from 'lucide-react';
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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);

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
                    companyName: internship?.company || 'N/A',
                    teacherName: teacher?.name || 'ยังไม่ได้มอบหมาย',
                    visitDate: 'ยังไม่ได้นัดหมาย', // Mock data for visit date
                    scheduleStatus: teacher ? 'รอนัดหมาย' : 'ยังไม่มอบหมาย',
                };
            });
    }, []);

    const filteredData = useMemo(() => {
        return scheduleData.filter(item => {
            const matchesSearch =
                item.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.studentId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.companyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.teacherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || item.scheduleStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [scheduleData, debouncedSearchTerm, statusFilter]);

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
                                    <TableHead className="text-white">ชื่อ-สกุล</TableHead>
                                    <TableHead className="text-white">บริษัท</TableHead>
                                    <TableHead className="text-white">อาจารย์นิเทศ</TableHead>
                                    <TableHead className="text-white">วันที่นัดหมาย</TableHead>
                                    <TableHead className="text-center text-white">สถานะ</TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
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
