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
import { Search, Download } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const reportData = useMemo(() => {
        // Mock data for reports
        return mockApplications
            .filter(app => app.status === 'approved')
            .map((app, index) => {
                const student = mockUsers.find(u => u.id === app.studentId);
                const internship = mockInternships.find(i => i.id === app.internshipId);
                const teacher = mockUsers.find(u => u.role === 'teacher');
                return {
                    ...app,
                    studentName: student?.name || 'N/A',
                    companyName: internship?.company || 'N/A',
                    teacherName: teacher?.name || 'N/A',
                    reportStatus: ['มีรายงานแล้ว', 'ยังไม่มีรายงาน'][index % 2],
                };
            });
    }, []);

    const filteredData = useMemo(() => {
        return reportData.filter(item => {
            const matchesSearch =
                item.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.companyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.teacherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || item.reportStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reportData, debouncedSearchTerm, statusFilter]);
    
    const statusColors: { [key: string]: string } = {
        'มีรายงานแล้ว': "bg-success text-white",
        'ยังไม่มีรายงาน': "bg-amber-500 text-white",
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">รายงานผลการนิเทศ</h1>
                <p>ดูและดาวน์โหลดรายงานผลการนิเทศทั้งหมด</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>รายการรายงานทั้งหมด</CardTitle>
                    <CardDescription>ค้นหาและกรองรายงานผลการนิเทศ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อนักศึกษา, บริษัท, อาจารย์..."
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
                                <SelectItem value="มีรายงานแล้ว">มีรายงานแล้ว</SelectItem>
                                <SelectItem value="ยังไม่มีรายงาน">ยังไม่มีรายงาน</SelectItem>
                            </SelectContent>
                        </Select>
                         <Button className="ml-auto" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            ดาวน์โหลดทั้งหมด
                        </Button>
                    </div>

                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-600 hover:bg-primary-600">
                                    <TableHead className="text-white">ชื่อ-สกุล</TableHead>
                                    <TableHead className="text-white">บริษัท</TableHead>
                                    <TableHead className="text-white">อาจารย์นิเทศ</TableHead>
                                    <TableHead className="text-center text-white">สถานะรายงาน</TableHead>
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
                                            <TableCell className="text-center">
                                                 <Badge className={`capitalize ${statusColors[item.reportStatus]}`}>
                                                    {item.reportStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    disabled={item.reportStatus === 'ยังไม่มีรายงาน'}
                                                    onClick={() => alert('ฟังก์ชันยังไม่ถูกใช้งาน')}
                                                >
                                                    ดูรายงาน
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
