'use client';

import { useState, useMemo } from 'react';
import { internships as mockInternships, applications as mockApplications } from '@/lib/data';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AdminCompaniesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const companyData = useMemo(() => {
        const companyMap = new Map<string, { company: string, location: string, studentCount: number }>();

        mockInternships.forEach(internship => {
            if (!companyMap.has(internship.company)) {
                companyMap.set(internship.company, {
                    company: internship.company,
                    location: internship.location,
                    studentCount: 0
                });
            }
        });

        mockApplications.forEach(app => {
            if (app.status === 'approved') {
                const internship = mockInternships.find(i => i.id === app.internshipId);
                if (internship && companyMap.has(internship.company)) {
                    const company = companyMap.get(internship.company)!;
                    company.studentCount++;
                }
            }
        });

        return Array.from(companyMap.values());
    }, []);

    const filteredData = useMemo(() => {
        return companyData.filter(item => {
            const matchesSearch =
                item.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            return matchesSearch;
        });
    }, [companyData, debouncedSearchTerm]);

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">ข้อมูลสถานประกอบการ</h1>
                <p>ภาพรวมและจัดการข้อมูลสถานประกอบการทั้งหมด</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>รายชื่อสถานประกอบการ</CardTitle>
                    <CardDescription>ค้นหาสถานประกอบการในระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อบริษัท, ที่ตั้ง..."
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
                                    <TableHead className="text-white">ชื่อสถานประกอบการ</TableHead>
                                    <TableHead className="text-white">ที่ตั้ง</TableHead>
                                    <TableHead className="text-center text-white">จำนวนนักศึกษา</TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.company}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell className="text-center">{item.studentCount}</TableCell>
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="outline">
                                                    ดูรายละเอียด
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
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
