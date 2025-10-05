'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, FileText, Calendar } from 'lucide-react';

interface Application {
    id: string;
    studentId: string;
    studentName: string;
    major: string;
    companyName: string;
    position: string;
    status: string;
    dateApplied: string;
    isPrinted: boolean;
    printRecord?: {
        id: string;
        documentNumber: string;
        documentDate: string;
    };
}

export default function ApplicationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/applications/print');
            const data = await response.json();
            
            if (data.applications) {
                setApplications(data.applications);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintDocument = async (applicationId: string) => {
        try {
            const response = await fetch('/api/applications/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationIds: [applicationId],
                    documentNumber: `DOC-${Date.now()}`,
                    documentDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('พิมพ์เอกสารสำเร็จ');
                loadApplications(); // รีเฟรชข้อมูล
            } else {
                alert('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
            }
        } catch (error) {
            console.error('Error printing document:', error);
            alert('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
        }
    };

    const mockApplications = [
        {
            id: 'APP001',
            studentId: '6400112233',
            studentName: 'นายรักดี จิตดี',
            company: 'บริษัท ABC จำกัด',
            position: 'นักพัฒนาซอฟต์แวร์',
            submittedDate: '15 ม.ค. 2568',
            status: 'รอตรวจสอบ',
            documents: ['ใบสมัคร', 'ใบรับรอง', 'ประวัติส่วนตัว']
        },
        {
            id: 'APP002',
            studentId: '6400112234',
            studentName: 'นางสาวมาลี สวยงาม',
            company: 'บริษัท XYZ จำกัด',
            position: 'นักวิเคราะห์ระบบ',
            submittedDate: '14 ม.ค. 2568',
            status: 'อนุมัติแล้ว',
            documents: ['ใบสมัคร', 'ใบรับรอง', 'ประวัติส่วนตัว', 'หนังสือรับรอง']
        },
        {
            id: 'APP003',
            studentId: '6400112235',
            studentName: 'นายสมชาย ใจดี',
            company: 'บริษัท DEF จำกัด',
            position: 'นักออกแบบ UI/UX',
            submittedDate: '13 ม.ค. 2568',
            status: 'ต้องแก้ไข',
            documents: ['ใบสมัคร', 'ใบรับรอง']
        },
        {
            id: 'APP004',
            studentId: '6400112236',
            studentName: 'นางสาวสุดา ขยัน',
            company: 'บริษัท GHI จำกัด',
            position: 'นักทดสอบซอฟต์แวร์',
            submittedDate: '12 ม.ค. 2568',
            status: 'เสร็จสิ้น',
            documents: ['ใบสมัคร', 'ใบรับรอง', 'ประวัติส่วนตัว', 'หนังสือรับรอง', 'รายงานผล']
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

    const filteredApplications = applications.filter(app =>
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.includes(searchTerm) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">เอกสารขอสหกิจศึกษา / ฝึกงาน</h1>
                        <p className="text-gray-600 mt-2">จัดการเอกสารขอฝึกงานและสหกิจศึกษา</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออกรายงาน
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <FileText className="h-4 w-4 mr-2" />
                            สร้างเอกสารใหม่
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">รอตรวจสอบ</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {applications.filter(app => app.status === 'รอตรวจสอบ').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <FileText className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {applications.filter(app => app.status === 'อนุมัติแล้ว').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">ต้องแก้ไข</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {applications.filter(app => app.status === 'ต้องแก้ไข').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-red-100 rounded-full">
                                    <FileText className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {applications.filter(app => app.status === 'เสร็จสิ้น').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
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
                                    placeholder="ค้นหาด้วยชื่อนักศึกษา, รหัสนักศึกษา, บริษัท, หรือรหัสเอกสาร..."
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

                {/* Applications Table */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            รายการเอกสาร ({filteredApplications.length} รายการ)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">ไม่พบข้อมูลการสมัคร</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                <TableHeader>
                                    <TableRow className="bg-amber-50">
                                        <TableHead className="font-semibold text-amber-700">รหัสเอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                                        <TableHead className="font-semibold text-amber-700">สถานประกอบการ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">ตำแหน่ง</TableHead>
                                        <TableHead className="font-semibold text-amber-700">วันที่ยื่น</TableHead>
                                        <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">เอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{app.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{app.studentName}</p>
                                                    <p className="text-sm text-gray-500">{app.studentId}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{app.companyName}</TableCell>
                                            <TableCell>{app.position || 'ไม่ระบุ'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {new Date(app.dateApplied).toLocaleDateString('th-TH')}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        ใบสมัคร
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        ใบรับรอง
                                                    </Badge>
                                                    {app.isPrinted && (
                                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                                            พิมพ์แล้ว
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="sm" title="ดูรายละเอียด">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        title="พิมพ์เอกสาร"
                                                        onClick={() => handlePrintDocument(app.id)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}