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
import { Check, X, Search, Eye } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AdminPendingApplicationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const tableData = useMemo(() => {
        return mockApplications
            .filter(app => app.status === 'pending')
            .map(app => {
                const student = mockUsers.find(u => u.id === app.studentId);
                const internship = mockInternships.find(i => i.id === app.internshipId);
                return {
                    ...app,
                    studentName: student?.name || 'N/A',
                    studentId: student?.id || 'N/A',
                    major: 'เทคโนโลยีสารสนเทศ', // Mock data for major
                    companyName: internship?.company || 'N/A',
                };
            });
    }, []);

    const filteredData = useMemo(() => {
        return tableData.filter(item => {
            return item.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                   item.studentId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                   item.companyName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        });
    }, [tableData, debouncedSearchTerm]);

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
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
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
                </CardContent>
            </Card>
        </div>
    );
}
