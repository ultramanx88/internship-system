'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { roles as roleData } from '@/lib/permissions';
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
import { Upload, Trash2, UserPlus, Loader2 } from 'lucide-react';
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

export function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { toast } = useToast();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                // We throw an error here to be caught by the catch block
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้ อาจเกิดจากปัญหาการเชื่อมต่อฐานข้อมูล',
            });
            setUsers([]); // Set to empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (isLoading) return [];
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (user.id && user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
            const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as any);
            return matchesSearch && matchesRole;
        });
    }, [users, debouncedSearchTerm, roleFilter, isLoading]);

    const isAllSelected = !isLoading && filteredUsers.length > 0 && selected.size === filteredUsers.length;
    const isSomeSelected = !isLoading && selected.size > 0 && selected.size < filteredUsers.length;

    const toggleAll = () => {
        if (isAllSelected) {
            setSelected(new Set());
        } else {
            const newSelection = new Set(filteredUsers.map(u => u.id));
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selected) }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete users');
            }
            
            toast({
                title: 'ลบสำเร็จ',
                description: `ผู้ใช้จำนวน ${selected.size} คนถูกลบเรียบร้อยแล้ว`,
            });
            
            await fetchUsers();
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
      fetchUsers();
    }

    return (
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
                            <TableRow className="bg-primary-600 hover:bg-primary-600">
                                <TableHead className="w-[50px] text-white">
                                    <Checkbox
                                        checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                        onCheckedChange={toggleAll}
                                        disabled={isLoading}
                                    />
                                </TableHead>
                                <TableHead className="text-white">ชื่อ</TableHead>
                                <TableHead className="text-white">อีเมล</TableHead>
                                <TableHead className="text-white">รหัส</TableHead>
                                <TableHead className="text-white">ตำแหน่ง</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        กำลังโหลดข้อมูล...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} data-state={selected.has(user.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.has(user.id)}
                                                onCheckedChange={() => toggleRow(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.roles.map(r => roleTranslations[r as any] || r).join(', ')}</TableCell>
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
    );
}
