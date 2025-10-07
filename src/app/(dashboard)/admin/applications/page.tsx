'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
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
import { Check, X, Search, Eye, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

type ApplicationData = {
    id: string;
    studentName: string;
    studentId: string;
    major: string;
    companyName: string;
    status: string;
    dateApplied: string;
    feedback?: string;
    projectTopic?: string;
};

export default function AdminApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'priority' | 'date_desc' | 'date_asc'>('priority');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();

    const fetchApplications = useCallback(async (search: string, status: string, sort: string, page: number, limit: number) => {
        setIsLoading(true);
        try {
            const url = `/api/applications?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`;
            
            const response = await fetch(url, {
                headers: {
                    'x-user-id': user?.id || '',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            
            // Map API data to frontend format
            const mappedApplications = (data.applications || []).map((app: any) => ({
                id: app.id,
                studentName: app.student.name,
                studentId: app.student.id,
                // Map real major from API if available
                major: app.student.major?.nameTh || app.student.major?.nameEn || '-',
                companyName: app.internship.company.name,
                status: app.status,
                dateApplied: app.dateApplied,
                projectTopic: app.projectTopic,
                feedback: app.feedback
            }));
            
            setApplications(mappedApplications);
            setTotalApplications(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch applications error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลใบสมัครได้',
            });
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchApplications(debouncedSearchTerm, statusFilter, sortOrder, currentPage, pageSize);
    }, [fetchApplications, debouncedSearchTerm, statusFilter, sortOrder, currentPage, pageSize]);

    // Reset to first page when search/filter changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, statusFilter]);

    const toggleSortOrder = () => {
        if (sortOrder === 'priority') {
            setSortOrder('date_desc');
        } else if (sortOrder === 'date_desc') {
            setSortOrder('date_asc');
        } else {
            setSortOrder('priority');
        }
    };

    const getSortLabel = () => {
        switch (sortOrder) {
            case 'priority': return 'ความสำคัญ (รอตรวจสอบก่อน)';
            case 'date_desc': return 'วันที่ล่าสุดก่อน';
            case 'date_asc': return 'วันที่เก่าสุดก่อน';
            default: return 'ความสำคัญ';
        }
    };

    const statusColors: { [key: string]: string } = {
        approved: "bg-[#2f7b69] text-white",
        pending: "bg-[#f4a79d] text-secondary-foreground",
        rejected: "bg-[#a01f38] text-white",
    };

    const statusTranslations: { [key: string]: string } = {
      approved: "อนุมัติ",
      pending: "รอการตรวจสอบ",
      rejected: "ปฏิเสธ",
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">เอกสารขอฝึกงาน/สหกิจศึกษา</h1>
                <p>ตรวจสอบและจัดการเอกสารของนักเรียนทั้งหมด</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>รายการใบสมัครทั้งหมด</CardTitle>
                    <CardDescription>ค้นหาและกรองใบสมัครของนักเรียน</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อ, รหัสนักศึกษา, บริษัท..."
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
                                <SelectItem value="pending">รอการตรวจสอบ</SelectItem>
                                <SelectItem value="approved">อนุมัติ</SelectItem>
                                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={toggleSortOrder}
                            className="flex items-center gap-2"
                        >
                            {sortOrder === 'date_asc' ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <ArrowDown className="h-4 w-4" />
                            )}
                            {getSortLabel()}
                        </Button>
                    </div>

                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-600 hover:bg-primary-600">
                                    <TableHead className="text-white">รหัสนักศึกษา</TableHead>
                                    <TableHead className="text-white">ชื่อ-สกุล</TableHead>
                                    <TableHead className="text-white">สาขาวิชา</TableHead>
                                    <TableHead className="text-white">ชื่อบริษัท</TableHead>
                                    <TableHead className="text-center text-white">สถานะ</TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            กำลังโหลดข้อมูล...
                                        </TableCell>
                                    </TableRow>
                                ) : applications.length > 0 ? (
                                    applications.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.studentId}</TableCell>
                                            <TableCell className="font-medium">{item.studentName}</TableCell>
                                            <TableCell>{item.major}</TableCell>
                                            <TableCell>{item.companyName}</TableCell>
                                            <TableCell className="text-center">
                                                 <Badge className={`capitalize ${statusColors[item.status]}`}>
                                                    {statusTranslations[item.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button asChild size="icon" variant="outline" className="h-8 w-8">
                                                        <Link href={`/admin/applications/${item.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 text-green-600 hover:bg-green-200">
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
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
                    {totalApplications > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    แสดง {((currentPage - 1) * pageSize) + 1} ถึง {Math.min(currentPage * pageSize, totalApplications)} จาก {totalApplications} รายการ
                                </p>
                                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
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
                                    disabled={currentPage === 1 || isLoading}
                                >
                                    หน้าแรก
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoading}
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
                                        disabled={isLoading}
                                    />
                                    <span className="text-sm text-muted-foreground">จาก {totalPages}</span>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoading}
                                >
                                    ถัดไป
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || isLoading}
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
