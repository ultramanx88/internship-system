'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
import { Search, Download, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<'studentName' | 'companyName' | 'teacherName' | 'reportStatus' | 'priority'>('priority');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const reportData = useMemo(() => {
        // Mock data for reports
        return mockApplications
            .filter(app => app.status === 'approved')
            .map((app, index) => {
                const student = mockUsers.find(u => u.id === app.studentId);
                const internship = mockInternships.find(i => i.id === app.internshipId);
                const teacher = mockUsers.find(u => u.roles.includes('visitor'));
                
                // Generate priority score (1-5, where 5 is highest priority)
                const priority = Math.floor(Math.random() * 5) + 1;
                
                return {
                    ...app,
                    studentName: student?.name || 'N/A',
                    companyName: internship?.companyId || 'N/A',
                    teacherName: teacher?.name || 'N/A',
                    reportStatus: ['มีรายงานแล้ว', 'ยังไม่มีรายงาน'][index % 2],
                    priority: priority,
                };
            });
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let filtered = reportData.filter(item => {
            const matchesSearch =
                item.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.companyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.teacherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || item.reportStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];
            
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
    }, [reportData, debouncedSearchTerm, statusFilter, sortField, sortOrder]);

    // Apply pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAndSortedData.slice(startIndex, endIndex);
    }, [filteredAndSortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
    const totalItems = filteredAndSortedData.length;
    
    const statusColors: { [key: string]: string } = {
        'มีรายงานแล้ว': "bg-success text-white",
        'ยังไม่มีรายงาน': "bg-amber-500 text-white",
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

    const getPriorityStars = (priority: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-3 w-3 ${i < priority ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const handleDownloadAll = () => {
        const csvHeaders = [
            "ชื่อ-สกุล",
            "บริษัท",
            "อาจารย์นิเทศ",
            "ความสำคัญ",
            "สถานะรายงาน"
        ];
        
        const csvRows = filteredAndSortedData.map(item => 
            [
                `"${item.studentName}"`,
                `"${item.companyName}"`,
                `"${item.teacherName}"`,
                `"${item.priority}"`,
                `"${item.reportStatus}"`
            ].join(',')
        );

        const csvContent = "\uFEFF" + [csvHeaders.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'supervision_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">เรียงตาม:</span>
                            <Select value={sortField} onValueChange={(value) => setSortField(value as typeof sortField)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="priority">ความสำคัญ</SelectItem>
                                    <SelectItem value="studentName">ชื่อนักศึกษา</SelectItem>
                                    <SelectItem value="companyName">บริษัท</SelectItem>
                                    <SelectItem value="teacherName">อาจารย์</SelectItem>
                                    <SelectItem value="reportStatus">สถานะ</SelectItem>
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
                         <Button className="ml-auto" variant="outline" onClick={handleDownloadAll}>
                            <Download className="mr-2 h-4 w-4" />
                            ดาวน์โหลดทั้งหมด
                        </Button>
                    </div>

                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-600 hover:bg-primary-600">
                                    <TableHead 
                                        className="text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('priority')}
                                    >
                                        <div className="flex items-center gap-1">
                                            ความสำคัญ
                                            {getSortIcon('priority')}
                                        </div>
                                    </TableHead>
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
                                            อาจารย์นิเทศ
                                            {getSortIcon('teacherName')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-center text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('reportStatus')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            สถานะรายงาน
                                            {getSortIcon('reportStatus')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getPriorityStars(item.priority)}
                                                    <span className="ml-2 text-sm text-muted-foreground">({item.priority}/5)</span>
                                                </div>
                                            </TableCell>
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
                                                    asChild
                                                    size="sm" 
                                                    variant="outline" 
                                                    disabled={item.reportStatus === 'ยังไม่มีรายงาน'}
                                                >
                                                    <Link href={`/admin/reports/${item.id}`}>ดูรายงาน</Link>
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
                </CardContent>
            </Card>
        </div>
    );
}
