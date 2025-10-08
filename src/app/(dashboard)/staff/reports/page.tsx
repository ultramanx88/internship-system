'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AcademicYearSelector, SemesterSelector } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Users, Building, Calendar } from 'lucide-react';

export default function ReportsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('2568');
    const [selectedSemester, setSelectedSemester] = useState('1');

    // Sample data for charts
    const monthlyData = [
        { month: 'ม.ค.', applications: 45, approved: 38, rejected: 7 },
        { month: 'ก.พ.', applications: 52, approved: 44, rejected: 8 },
        { month: 'มี.ค.', applications: 38, approved: 32, rejected: 6 },
        { month: 'เม.ย.', applications: 61, approved: 55, rejected: 6 },
        { month: 'พ.ค.', applications: 49, approved: 42, rejected: 7 },
        { month: 'มิ.ย.', applications: 67, approved: 58, rejected: 9 }
    ];

    const statusData = [
        { name: 'อนุมัติแล้ว', value: 269, color: '#10B981' },
        { name: 'รอดำเนินการ', value: 43, color: '#F59E0B' },
        { name: 'ต้องแก้ไข', value: 18, color: '#EF4444' },
        { name: 'ปฏิเสธ', value: 12, color: '#6B7280' }
    ];

    const companyData = [
        { name: 'บริษัท ABC จำกัด', students: 15, status: 'ดีเยี่ยม' },
        { name: 'บริษัท XYZ จำกัด', students: 12, status: 'ดี' },
        { name: 'บริษัท DEF จำกัด', students: 10, status: 'ดี' },
        { name: 'บริษัท GHI จำกัด', students: 8, status: 'พอใช้' },
        { name: 'บริษัท JKL จำกัด', students: 6, status: 'ดี' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ดีเยี่ยม':
                return 'bg-green-100 text-green-700';
            case 'ดี':
                return 'bg-blue-100 text-blue-700';
            case 'พอใช้':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">รายงานผลการนิเทศ</h1>
                        <p className="text-gray-600 mt-2">รายงานและสถิติการฝึกงานและสหกิจศึกษา</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออก PDF
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <FileText className="h-4 w-4 mr-2" />
                            สร้างรายงาน
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">ปีการศึกษา:</span>
                                <AcademicYearSelector
                                    value={selectedPeriod}
                                    onChange={setSelectedPeriod}
                                    className="w-32"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">ภาคการศึกษา:</span>
                                <SemesterSelector
                                    academicYearId={selectedPeriod}
                                    value={selectedSemester}
                                    onChange={setSelectedSemester}
                                    className="w-32"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">นักศึกษาทั้งหมด</p>
                                    <p className="text-3xl font-bold text-gray-900">342</p>
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +12% จากเดือนที่แล้ว
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">สถานประกอบการ</p>
                                    <p className="text-3xl font-bold text-gray-900">67</p>
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +5 แห่งใหม่
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100">
                                    <Building className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">อัตราผ่าน</p>
                                    <p className="text-3xl font-bold text-gray-900">94.2%</p>
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +2.1% จากปีที่แล้ว
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                                    <p className="text-3xl font-bold text-gray-900">4.15</p>
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +0.08 จากปีที่แล้ว
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Applications Chart */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">
                                สถิติการสมัครรายเดือน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="applications" fill="#F59E0B" name="ยื่นสมัคร" />
                                    <Bar dataKey="approved" fill="#10B981" name="อนุมัติ" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Status Distribution Chart */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">
                                สัดส่วนสถานะการสมัคร
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Companies */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            สถานประกอบการยอดนิยม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {companyData.map((company, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                                            <span className="text-sm font-bold text-amber-700">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{company.name}</p>
                                            <p className="text-sm text-gray-600">{company.students} นักศึกษา</p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(company.status)}>
                                        {company.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}