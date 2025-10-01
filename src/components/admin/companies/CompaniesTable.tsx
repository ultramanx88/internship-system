'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Company } from '@prisma/client';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Trash2, Loader2, Edit, ArrowUp, ArrowDown, Plus, Globe, Phone, Mail } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AddCompanyForm } from './AddCompanyForm';
import { Badge } from '@/components/ui/badge';

type DisplayCompany = Company & {
    _count: {
        internships: number;
    };
};

const companySizeLabels = {
    startup: 'สตาร์ทอัพ',
    small: 'เล็ก (1-50 คน)',
    medium: 'กลาง (51-200 คน)',
    large: 'ใหญ่ (201-1000 คน)',
    enterprise: 'องค์กรขนาดใหญ่ (1000+ คน)',
};

const industryOptions = [
    'เทคโนโลยี',
    'การเงิน',
    'การผลิต',
    'การค้าปลีก',
    'การศึกษา',
    'สุขภาพ',
    'การท่องเที่ยว',
    'อสังหาริมทรัพย์',
    'การขนส่ง',
    'อื่นๆ',
];

export function CompaniesTable() {
    console.log('CompaniesTable component rendered');
    const [companies, setCompanies] = useState<DisplayCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [sizeFilter, setSizeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { toast } = useToast();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchCompanies = useCallback(async (
        search: string,
        industry: string,
        size: string,
        status: string,
        sort: string,
        page: number,
        limit: number
    ) => {
        console.log('fetchCompanies called with:', { search, industry, size, status, sort, page, limit });
        setIsLoading(true);
        try {
            const url = `/api/companies?search=${encodeURIComponent(search)}&industry=${encodeURIComponent(industry)}&size=${encodeURIComponent(size)}&isActive=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();
            setCompanies(data.companies || []);
            setTotalCompanies(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch companies error:', error);
            const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลบริษัทได้';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: errorMessage,
            });
            setCompanies([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCompanies(debouncedSearchTerm, industryFilter, sizeFilter, statusFilter, sortOrder, currentPage, pageSize);
    }, [fetchCompanies, debouncedSearchTerm, industryFilter, sizeFilter, statusFilter, sortOrder, currentPage, pageSize]);

    // Reset to first page when search/filter changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, industryFilter, sizeFilter, statusFilter]);

    const isAllSelected = !isLoading && companies.length > 0 && selected.size === companies.length;
    const isSomeSelected = !isLoading && selected.size > 0 && selected.size < companies.length;

    const toggleAll = () => {
        if (isAllSelected) {
            setSelected(new Set());
        } else {
            const newSelection = new Set(companies.map(c => c.id));
            setSelected(newSelection);
        }
    };

    const toggleRow = (id: string) => {
        const newSelection = new Set(selected);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelected(newSelection);
    };

    const deleteSelected = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบริษัท ${selected.size} แห่ง?`)) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/companies', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selected) }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete companies');
            }

            toast({
                title: 'ลบสำเร็จ',
                description: `บริษัทจำนวน ${selected.size} แห่งถูกลบเรียบร้อยแล้ว`,
            });

            fetchCompanies(debouncedSearchTerm, industryFilter, sizeFilter, statusFilter, sortOrder, currentPage, pageSize);
            setSelected(new Set());

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบบริษัทได้',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSuccess = () => {
        setIsAddCompanyOpen(false);
        fetchCompanies(debouncedSearchTerm, industryFilter, sizeFilter, statusFilter, sortOrder, 1, pageSize);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center">
                        <p className="text-destructive mb-4">เกิดข้อผิดพลาด: {error}</p>
                        <Button onClick={() => {
                            setError(null);
                            fetchCompanies(debouncedSearchTerm, industryFilter, sizeFilter, statusFilter, sortOrder, currentPage, pageSize);
                        }}>
                            ลองใหม่
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <style jsx>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            <Card>
                <CardHeader>
                    <CardTitle>รายชื่อสถานประกอบการ</CardTitle>
                    <CardDescription>ค้นหา, จัดการ, และเพิ่มสถานประกอบการใหม่</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <Input
                            placeholder="ค้นหาชื่อบริษัท, อีเมล, หรือเบอร์โทร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={industryFilter} onValueChange={setIndustryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="อุตสาหกรรมทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">อุตสาหกรรมทั้งหมด</SelectItem>
                                {industryOptions.map(industry => (
                                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sizeFilter} onValueChange={setSizeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="ขนาดทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ขนาดทั้งหมด</SelectItem>
                                {Object.entries(companySizeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="สถานะทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                                <SelectItem value="true">ใช้งาน</SelectItem>
                                <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                            </SelectContent>
                        </Select>
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
                        <div className="ml-auto flex flex-wrap items-center gap-2">
                            <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        เพิ่มบริษัท
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>เพิ่มสถานประกอบการใหม่</DialogTitle>
                                        <DialogDescription>
                                            กรอกรายละเอียดเพื่อเพิ่มสถานประกอบการใหม่
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddCompanyForm
                                        onSuccess={handleSuccess}
                                        onCancel={() => setIsAddCompanyOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="destructive"
                                onClick={deleteSelected}
                                disabled={selected.size === 0 || isDeleting}
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                {isDeleting ? 'กำลังลบ...' : `ลบ (${selected.size})`}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow
                                    className="hover:opacity-90"
                                    style={{
                                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #60a5fa 50%, #93c5fd 75%, #dbeafe 100%)',
                                        backgroundSize: '300% 300%',
                                        animation: 'gradientShift 4s ease infinite'
                                    }}
                                >
                                    <TableHead className="w-[50px] text-white">
                                        <Checkbox
                                            checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                            onCheckedChange={toggleAll}
                                            disabled={isLoading}
                                        />
                                    </TableHead>
                                    <TableHead className="text-white">ชื่อบริษัท</TableHead>
                                    <TableHead className="text-white">อุตสาหกรรม</TableHead>
                                    <TableHead className="text-white">ขนาด</TableHead>
                                    <TableHead className="text-white">จังหวัด</TableHead>
                                    <TableHead className="text-white">ติดต่อ</TableHead>
                                    <TableHead className="text-white">ตำแหน่งงาน</TableHead>
                                    <TableHead className="text-white">สถานะ</TableHead>
                                    <TableHead className="text-white text-center">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            กำลังโหลดข้อมูล...
                                        </TableCell>
                                    </TableRow>
                                ) : companies.length > 0 ? (
                                    companies.map((company) => (
                                        <TableRow key={company.id} data-state={selected.has(company.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.has(company.id)}
                                                    onCheckedChange={() => toggleRow(company.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{company.name}</div>
                                                        {company.nameEn && (
                                                            <div className="text-sm text-muted-foreground">{company.nameEn}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{company.industry || '-'}</TableCell>
                                            <TableCell>
                                                {company.size ? companySizeLabels[company.size] : '-'}
                                            </TableCell>
                                            <TableCell>{company.province || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {company.phone && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3" />
                                                            {company.phone}
                                                        </div>
                                                    )}
                                                    {company.email && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Mail className="h-3 w-3" />
                                                            {company.email}
                                                        </div>
                                                    )}
                                                    {company.website && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Globe className="h-3 w-3" />
                                                            <a 
                                                                href={company.website} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                เว็บไซต์
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {company._count.internships} ตำแหน่ง
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={company.isActive ? "default" : "secondary"}>
                                                    {company.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                                                    <Link href={`/admin/companies/${company.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalCompanies > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    แสดง {((currentPage - 1) * pageSize) + 1} ถึง {Math.min(currentPage * pageSize, totalCompanies)} จาก {totalCompanies} รายการ
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
                                        <SelectItem value="100">100</SelectItem>
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
        </>
    );
}