'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { users as mockUsers } from '@/lib/data';
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
import { AddRounded, DeleteForeverRounded, FilterAlt, FileUploadRounded, UserPlus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function UsersTable() {
    const [users, setUsers] = useState(mockUsers);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, debouncedSearchTerm, roleFilter]);

    const isAllSelected = filteredUsers.length > 0 && selected.size === filteredUsers.length;
    const isSomeSelected = selected.size > 0 && selected.size < filteredUsers.length;

    const toggleAll = () => {
        if (isAllSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredUsers.map(u => u.id)));
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

    const deleteSelected = () => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ ${selected.size} คน?`)) return;
        setUsers(users.filter(u => !selected.has(u.id)));
        setSelected(new Set());
    };
    
    const roleTranslations: { [key: string]: string } = {
        admin: 'ผู้ดูแลระบบ',
        teacher: 'อาจารย์',
        student: 'นักเรียน'
    };

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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="ตำแหน่งทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ตำแหน่งทั้งหมด</SelectItem>
                            <SelectItem value="student">นักเรียน</SelectItem>
                            <SelectItem value="teacher">อาจารย์</SelectItem>
                            <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        <Button variant="outline">
                            <FileUploadRounded className="mr-2 h-4 w-4" />
                            อัปโหลด Excel
                        </Button>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            เพิ่มผู้ใช้
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={deleteSelected}
                            disabled={selected.size === 0}
                        >
                            <DeleteForeverRounded className="mr-2 h-4 w-4" />
                            ลบ ({selected.size})
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
                                    />
                                </TableHead>
                                <TableHead className="text-white">ชื่อ</TableHead>
                                <TableHead className="text-white">อีเมล</TableHead>
                                <TableHead className="text-white">รหัส</TableHead>
                                <TableHead className="text-white">ตำแหน่ง</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
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
                                        <TableCell>{roleTranslations[user.role]}</TableCell>
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
