'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AdminGuard } from '@/components/auth/PermissionGuard';
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
import { Search, Download, ArrowUp, ArrowDown, Star, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

type ReportData = {
    id: string;
    title: string;
    studentName: string;
    studentId: string;
    companyName: string;
    supervisorName: string;
    status: string;
    priority: number;
    createdAt: string;
    submittedAt?: string;
    reviewedAt?: string;
    feedback?: string;
};

export default function AdminReportsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<'studentName' | 'companyName' | 'supervisorName' | 'status' | 'priority'>('priority');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);

    const fetchReports = useCallback(async (search: string, status: string, sort: string, page: number, limit: number) => {
        setIsLoading(true);
        try {
            const url = `/api/reports?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`;
            
            const response = await fetch(url, {
                headers: {
                    'x-user-id': user?.id || '',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            const data = await response.json();
            
            // Map API data to frontend format
            const mappedReports = (data.reports || []).map((report: any) => ({
                id: report.id,
                title: report.title,
                studentName: report.student.name,
                studentId: report.student.id,
                companyName: report.application.internship.company.name,
                supervisorName: report.supervisor?.name || 'ไม่ระบุ',
                status: report.status,
                priority: Math.floor(Math.random() * 5) + 1, // Mock priority for now
                createdAt: report.createdAt,
                submittedAt: report.submittedAt,
                reviewedAt: report.reviewedAt,
                feedback: report.feedback
            }));
            
            setReports(mappedReports);
            setTotalReports(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch reports error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลรายงานได้',
            });
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, toast]);

    useEffect(() => {
        fetchReports(debouncedSearchTerm, statusFilter, sortOrder, currentPage, pageSize);
    }, [fetchReports, debouncedSearchTerm, statusFilter, sortOrder, currentPage, pageSize]);

    const reportData = useMemo(() => {
        return reports;
    }, [reports]);

    // Data is already filtered and sorted by API
    const paginatedData = useMemo(() => {
        return reportData;
    }, [reportData]);

    const totalItems = totalReports;
    
    const statusColors: { [key: string]: string } = {
        'draft': "bg-gray-500 text-white",
        'submitted': "bg-blue-500 text-white",
        'reviewed': "bg-yellow-500 text-white",
        'approved': "bg-green-500 text-white",
        'rejected': "bg-red-500 text-white",
    };

    const statusTranslations: { [key: string]: string } = {
        'draft': "ร่าง",
        'submitted': "ส่งแล้ว",
        'reviewed': "ตรวจแล้ว",
        'approved': "อนุมัติ",
        'rejected': "ปฏิเสธ",
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
            "อาจารย์นิเทศก์",
            "ความสำคัญ",
            "สถานะรายงาน"
        ];
        
        const csvRows = paginatedData.map(item => 
            [
                `"${item.studentName}"`,
                `"${item.companyName}"`,
                `"${item.supervisorName}"`,
                `"${item.priority}"`,
                `"${statusTranslations[item.status] || item.status}"`
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
        <AdminGuard>
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
                                <SelectItem value="draft">ร่าง</SelectItem>
                                <SelectItem value="submitted">ส่งแล้ว</SelectItem>
                                <SelectItem value="reviewed">ตรวจแล้ว</SelectItem>
                                <SelectItem value="approved">อนุมัติ</SelectItem>
                                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
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
                                    <SelectItem value="supervisorName">อาจารย์นิเทศก์</SelectItem>
                                    <SelectItem value="status">สถานะ</SelectItem>
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
                                        onClick={() => handleSort('supervisorName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            อาจารย์นิเทศก์
                                            {getSortIcon('supervisorName')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-center text-white cursor-pointer hover:bg-primary-700"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            สถานะรายงาน
                                            {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                กำลังโหลดข้อมูล...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedData.length > 0 ? (
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
                                            <TableCell>{item.supervisorName}</TableCell>
                                            <TableCell className="text-center">
                                                 <Badge className={`capitalize ${statusColors[item.status]}`}>
                                                    {statusTranslations[item.status] || item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    asChild
                                                    size="sm" 
                                                    variant="outline" 
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
        </AdminGuard>
    );
}
