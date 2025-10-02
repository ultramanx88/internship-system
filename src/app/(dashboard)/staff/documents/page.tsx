'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, Upload, FileText, Calendar, User } from 'lucide-react';

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const documents = [
        {
            id: 'DOC001',
            title: 'ใบสมัครฝึกงาน',
            studentName: 'นายรักดี จิตดี',
            studentId: '6400112233',
            type: 'ใบสมัคร',
            uploadDate: '15 ม.ค. 2568',
            status: 'รอตรวจสอบ',
            fileSize: '2.5 MB',
            format: 'PDF'
        },
        {
            id: 'DOC002',
            title: 'ใบรับรองผลการศึกษา',
            studentName: 'นางสาวมาลี สวยงาม',
            studentId: '6400112234',
            type: 'ใบรับรอง',
            uploadDate: '14 ม.ค. 2568',
            status: 'อนุมัติแล้ว',
            fileSize: '1.8 MB',
            format: 'PDF'
        },
        {
            id: 'DOC003',
            title: 'ประวัติส่วนตัว (Resume)',
            studentName: 'นายสมชาย ใจดี',
            studentId: '6400112235',
            type: 'ประวัติส่วนตัว',
            uploadDate: '13 ม.ค. 2568',
            status: 'ต้องแก้ไข',
            fileSize: '3.2 MB',
            format: 'PDF'
        },
        {
            id: 'DOC004',
            title: 'หนังสือรับรองจากบริษัท',
            studentName: 'นางสาวสุดา ขยัน',
            studentId: '6400112236',
            type: 'หนังสือรับรอง',
            uploadDate: '12 ม.ค. 2568',
            status: 'เสร็จสิ้น',
            fileSize: '1.5 MB',
            format: 'PDF'
        },
        {
            id: 'DOC005',
            title: 'รายงานการฝึกงาน',
            studentName: 'นายรักดี จิตดี',
            studentId: '6400112233',
            type: 'รายงาน',
            uploadDate: '11 ม.ค. 2568',
            status: 'รอตรวจสอบ',
            fileSize: '5.7 MB',
            format: 'PDF'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'รอตรวจสอบ':
                return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
            case 'อนุมัติแล้ว':
                return <Badge className="bg-green-100 text-green-700">อนุมัติแล้ว</Badge>;
            case 'ต้องแก้ไข':
                return <Badge className="bg-red-100 text-red-700">ต้องแก้ไข</Badge>;
            case 'เสร็จสิ้น':
                return <Badge className="bg-blue-100 text-blue-700">เสร็จสิ้น</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ใบสมัคร':
                return 'bg-blue-100 text-blue-700';
            case 'ใบรับรอง':
                return 'bg-green-100 text-green-700';
            case 'ประวัติส่วนตัว':
                return 'bg-purple-100 text-purple-700';
            case 'หนังสือรับรอง':
                return 'bg-orange-100 text-orange-700';
            case 'รายงาน':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.studentId.includes(searchTerm) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">นัดหมายนิเทศ</h1>
                        <p className="text-gray-600 mt-2">จัดการเอกสารและไฟล์ต่างๆ ในระบบ</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออกรายการ
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Upload className="h-4 w-4 mr-2" />
                            อัปโหลดเอกสาร
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">ทั้งหมด</p>
                                    <p className="text-2xl font-bold text-gray-700">{documents.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">รอตรวจสอบ</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {documents.filter(doc => doc.status === 'รอตรวจสอบ').length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {documents.filter(doc => doc.status === 'อนุมัติแล้ว').length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">ต้องแก้ไข</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {documents.filter(doc => doc.status === 'ต้องแก้ไข').length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {documents.filter(doc => doc.status === 'เสร็จสิ้น').length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="ค้นหาด้วยชื่อเอกสาร, ชื่อนักศึกษา, รหัสนักศึกษา, หรือประเภทเอกสาร..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">
                                ตัวกรอง
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Table */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            รายการเอกสาร ({filteredDocuments.length} ไฟล์)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-amber-50">
                                        <TableHead className="font-semibold text-amber-700">รหัสเอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700">ชื่อเอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                                        <TableHead className="font-semibold text-amber-700">ประเภท</TableHead>
                                        <TableHead className="font-semibold text-amber-700">วันที่อัปโหลด</TableHead>
                                        <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">ขนาดไฟล์</TableHead>
                                        <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map((doc) => (
                                        <TableRow key={doc.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{doc.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <p className="font-medium">{doc.title}</p>
                                                        <p className="text-xs text-gray-500">{doc.format}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">{doc.studentName}</p>
                                                        <p className="text-sm text-gray-500">{doc.studentId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(doc.type)}>
                                                    {doc.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {doc.uploadDate}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{doc.fileSize}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}