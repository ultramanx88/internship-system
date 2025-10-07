'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';

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

type PendingApplicationData = {
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

export default function AdminPendingApplicationsPage() {
    const [applications, setApplications] = useState<PendingApplicationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = ล่าสุดก่อน, asc = เก่าสุดก่อน
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();

    const fetchPendingApplications = useCallback(async (search: string, sort: string, page: number, limit: number) => {
        setIsLoading(true);
        try {
            const url = `/api/applications/pending?search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch pending applications');
            }

            const data = await response.json();
            const mapped: PendingApplicationData[] = (data.applications || []).map((app: any) => ({
                id: app.id,
                studentName: app.student?.name ?? '-',
                studentId: app.student?.id ?? '-',
                major: app.student?.major?.nameTh ?? app.student?.major?.nameEn ?? '-',
                companyName: app.internship?.company?.name ?? '-',
                status: app.status ?? 'pending',
                dateApplied: app.dateApplied,
                feedback: app.feedback,
                projectTopic: app.projectTopic,
            }));
            setApplications(mapped);
            setTotalApplications(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch pending applications error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลใบสมัครที่รอการตรวจสอบได้',
            });
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPendingApplications(debouncedSearchTerm, sortOrder, currentPage, pageSize);
    }, [fetchPendingApplications, debouncedSearchTerm, sortOrder, currentPage, pageSize]);

    // Reset to first page when search changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const statusColors: { [key: string]: string } = {
        pending: "bg-[#f4a79d] text-secondary-foreground",
    };

    const statusTranslations: { [key: string]: string } = {
      pending: "รอการตรวจสอบ",
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">ใบสมัครที่รอการตรวจสอบ</h1>
                <p>ตรวจสอบและดำเนินการกับใบสมัครที่ยังไม่ได้รับการตัดสินใจ</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>รายการใบสมัครที่รอการตรวจสอบ</CardTitle>
                    <CardDescription>ค้นหาใบสมัครที่ต้องดำเนินการ</CardDescription>
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
                        <Button
                            variant="outline"
                            onClick={toggleSortOrder}
                            className="flex items-center gap-2"
                        >
                            {sortOrder === 'desc' ? (
                                <>
                                    <ArrowDown className="h-4 w-4" />
                                    ล่าสุดก่อน
                                </>
                            ) : (
                                <>
                                    <ArrowUp className="h-4 w-4" />
                                    เก่าสุดก่อน
                                </>
                            )}
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
                                                    <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 text-green-600 hover:bg-green-200">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            ไม่มีใบสมัครที่รอการตรวจสอบ
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
