'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { User } from '@prisma/client';
import { roles as roleData } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
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
import { Upload, Trash2, UserPlus, Loader2, Edit, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AddUserForm } from './AddUserForm';
import { UploadUsersDialog } from './UploadUsersDialog';

type DisplayUser = User & {
    t_title?: string | null;
    t_name?: string | null;
    t_surname?: string | null;
    e_title?: string | null;
    e_name?: string | null;
    e_middle_name?: string | null;
    e_surname?: string | null;
    username?: string | null;
}

export function UsersTable() {
    const { user } = useAuth();
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default: newest first
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { toast } = useToast();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchUsers = useCallback(async (search: string, role: string, sort: string, page: number, limit: number) => {
        setIsLoading(true);
        try {
            const url = `/api/users?search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}&sort=${encodeURIComponent(sort)}&page=${page}&limit=${limit}`;
            console.log('Fetching users from:', url);

            const response = await fetch(url, {
                headers: {
                    'x-user-id': user?.id || '',
                },
            });
            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched users:', data.users?.length || 0, 'users, total:', data.total);
            
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch users error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
            });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers(debouncedSearchTerm, roleFilter, sortOrder, currentPage, pageSize);
    }, [fetchUsers, debouncedSearchTerm, roleFilter, sortOrder, currentPage, pageSize]);

    // Reset to first page when search/filter changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, roleFilter]);

    const isAllSelected = !isLoading && users.length > 0 && selected.size === users.length;
    const isSomeSelected = !isLoading && selected.size > 0 && selected.size < users.length;

    const toggleAll = () => {
        if (isAllSelected) {
            setSelected(new Set());
        } else {
            const newSelection = new Set(users.map(u => u.id));
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
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ ${selected.size} คน?`)) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                },
                body: JSON.stringify({ ids: Array.from(selected) }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete users');
            }

            toast({
                title: 'ลบสำเร็จ',
                description: `ผู้ใช้จำนวน ${selected.size} คนถูกลบเรียบร้อยแล้ว`,
            });

            fetchUsers(debouncedSearchTerm, roleFilter, sortOrder, currentPage, pageSize);
            setSelected(new Set());

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบผู้ใช้ได้',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const roleTranslations = useMemo(() => {
        const translations: { [key: string]: string } = {};
        roleData.forEach(role => {
            translations[role.id] = role.label;
        });
        return translations;
    }, []);

    const handleSuccess = () => {
        setIsAddUserOpen(false);
        setIsUploadOpen(false);
        fetchUsers(debouncedSearchTerm, roleFilter, sortOrder, 1, pageSize);
    }

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    // Helper functions for displaying names based on nationality
    const getDisplayTitle = (user: DisplayUser) => {
        // If has Thai name, show Thai title (Thai student)
        if (user.t_name) {
            return user.t_title || '-';
        }
        // If no Thai name, show English title (International student)
        return user.e_title || '-';
    };

    const getDisplayName = (user: DisplayUser) => {
        // If has Thai name, show Thai name (Thai student)
        if (user.t_name) {
            return user.t_name;
        }
        // If no Thai name (International student), show English first name + middle name
        const parts = [user.e_name, user.e_middle_name].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : '-';
    };

    const getDisplaySurname = (user: DisplayUser) => {
        // If has Thai name, show Thai surname only (Thai student)
        if (user.t_name) {
            return user.t_surname || '-';
        }
        // If no Thai name (International student), show English surname only
        return user.e_surname || '-';
    };

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
                    <CardTitle>รายชื่อทั้งหมด</CardTitle>
                    <CardDescription>ค้นหา, จัดการ, และเพิ่มผู้ใช้ใหม่</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <Input
                            placeholder="ค้นหาชื่อ, อีเมล, หรือรหัส..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="ตำแหน่งทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ตำแหน่งทั้งหมด</SelectItem>
                                {roleData.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                ))}
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
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Upload className="mr-2 h-4 w-4" />
                                        อัปโหลด Excel
                                    </Button>
                                </DialogTrigger>
                                <UploadUsersDialog
                                    onCancel={() => setIsUploadOpen(false)}
                                    onSuccess={handleSuccess}
                                />
                            </Dialog>
                            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        เพิ่มผู้ใช้
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[480px]">
                                    <DialogHeader>
                                        <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
                                        <DialogDescription>
                                            กรอกรายละเอียดเพื่อสร้างบัญชีผู้ใช้ใหม่
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddUserForm
                                        onSuccess={handleSuccess}
                                        onCancel={() => setIsAddUserOpen(false)}
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
                                        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #D2691E 50%, #CD853F 75%, #DEB887 100%)',
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
                                    <TableHead className="text-white">รหัสนักศึกษา</TableHead>
                                    <TableHead className="text-white">คำนำหน้า</TableHead>
                                    <TableHead className="text-white">ชื่อ</TableHead>
                                    <TableHead className="text-white">นามสกุล</TableHead>
                                    <TableHead className="text-white">ตำแหน่ง</TableHead>
                                    <TableHead className="text-white text-center">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            กำลังโหลดข้อมูล...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id} data-state={selected.has(user.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.has(user.id)}
                                                    onCheckedChange={() => toggleRow(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{user.username || '-'}</TableCell>
                                            <TableCell>{getDisplayTitle(user)}</TableCell>
                                            <TableCell>{getDisplayName(user)}</TableCell>
                                            <TableCell>{getDisplaySurname(user)}</TableCell>
                                            <TableCell>{Array.isArray(user.roles) ? user.roles.map((r: any) => roleTranslations[r as any] || r).join(', ') : user.roles}</TableCell>
                                            <TableCell className="text-center">
                                                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalUsers > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    แสดง {((currentPage - 1) * pageSize) + 1} ถึง {Math.min(currentPage * pageSize, totalUsers)} จาก {totalUsers} รายการ
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
