'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Download, Star, TrendingUp, Users, Building } from 'lucide-react';

export default function EvaluationPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const evaluations = [
        {
            id: 'EVAL001',
            studentName: 'นายรักดี จิตดี',
            studentId: '6400112233',
            company: 'บริษัท ABC จำกัด',
            evaluationDate: '20 ม.ค. 2568',
            overallRating: 4.5,
            status: 'เสร็จสิ้น',
            categories: {
                workQuality: 4.5,
                punctuality: 4.0,
                teamwork: 5.0,
                communication: 4.0,
                learning: 4.5
            }
        },
        {
            id: 'EVAL002',
            studentName: 'นางสาวมาลี สวยงาม',
            studentId: '6400112234',
            company: 'บริษัท XYZ จำกัด',
            evaluationDate: '19 ม.ค. 2568',
            overallRating: 4.2,
            status: 'เสร็จสิ้น',
            categories: {
                workQuality: 4.0,
                punctuality: 4.5,
                teamwork: 4.0,
                communication: 4.5,
                learning: 4.0
            }
        },
        {
            id: 'EVAL003',
            studentName: 'นายสมชาย ใจดี',
            studentId: '6400112235',
            company: 'บริษัท DEF จำกัด',
            evaluationDate: '18 ม.ค. 2568',
            overallRating: 3.8,
            status: 'รอตรวจสอบ',
            categories: {
                workQuality: 4.0,
                punctuality: 3.5,
                teamwork: 4.0,
                communication: 3.5,
                learning: 4.0
            }
        }
    ];

    const companyRatings = [
        {
            company: 'บริษัท ABC จำกัด',
            totalStudents: 15,
            averageRating: 4.3,
            trend: 'up',
            categories: {
                environment: 4.5,
                supervision: 4.2,
                learning: 4.1,
                facilities: 4.4
            }
        },
        {
            company: 'บริษัท XYZ จำกัด',
            totalStudents: 12,
            averageRating: 4.1,
            trend: 'stable',
            categories: {
                environment: 4.0,
                supervision: 4.2,
                learning: 4.0,
                facilities: 4.2
            }
        },
        {
            company: 'บริษัท DEF จำกัด',
            totalStudents: 10,
            averageRating: 3.9,
            trend: 'down',
            categories: {
                environment: 3.8,
                supervision: 4.0,
                learning: 3.9,
                facilities: 3.9
            }
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'เสร็จสิ้น':
                return <Badge className="bg-green-100 text-green-700">เสร็จสิ้น</Badge>;
            case 'รอตรวจสอบ':
                return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
            default:
                return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
        }
    };

    const filteredEvaluations = evaluations.filter(eval =>
        eval.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eval.studentId.includes(searchTerm) ||
        eval.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">รายงานการประเมินสถานประกอบการ</h1>
                        <p className="text-gray-600 mt-2">ดูและจัดการผลการประเมินจากนักศึกษา</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออกรายงาน
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">การประเมินทั้งหมด</p>
                                    <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <Star className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                                    <p className="text-3xl font-bold text-gray-900">4.17</p>
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
                                    <p className="text-sm font-medium text-gray-600">นักศึกษาที่ประเมิน</p>
                                    <p className="text-3xl font-bold text-gray-900">37</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">สถานประกอบการ</p>
                                    <p className="text-3xl font-bold text-gray-900">25</p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-100">
                                    <Building className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="student-evaluations" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student-evaluations">การประเมินจากนักศึกษา</TabsTrigger>
                        <TabsTrigger value="company-ratings">คะแนนสถานประกอบการ</TabsTrigger>
                    </TabsList>

                    <TabsContent value="student-evaluations" className="space-y-6">
                        {/* Search */}
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="ค้นหาด้วยชื่อนักศึกษา, รหัสนักศึกษา, หรือชื่อบริษัท..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Evaluations Table */}
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700">
                                    การประเมินจากนักศึกษา ({filteredEvaluations.length} รายการ)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-amber-50">
                                                <TableHead className="font-semibold text-amber-700">รหัสการประเมิน</TableHead>
                                                <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                                                <TableHead className="font-semibold text-amber-700">สถานประกอบการ</TableHead>
                                                <TableHead className="font-semibold text-amber-700">วันที่ประเมิน</TableHead>
                                                <TableHead className="font-semibold text-amber-700">คะแนนรวม</TableHead>
                                                <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                                                <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEvaluations.map((evaluation) => (
                                                <TableRow key={evaluation.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">{evaluation.id}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{evaluation.studentName}</p>
                                                            <p className="text-sm text-gray-500">{evaluation.studentId}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{evaluation.company}</TableCell>
                                                    <TableCell>{evaluation.evaluationDate}</TableCell>
                                                    <TableCell>
                                                        {renderStars(evaluation.overallRating)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
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
                    </TabsContent>

                    <TabsContent value="company-ratings" className="space-y-6">
                        {/* Company Ratings */}
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700">
                                    คะแนนประเมินสถานประกอบการ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {companyRatings.map((company, index) => (
                                        <div key={index} className="p-6 border rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">{company.company}</h3>
                                                    {getTrendIcon(company.trend)}
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(company.averageRating)}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{company.totalStudents} นักศึกษา</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-gray-600">สภาพแวดล้อม</p>
                                                    <p className="text-lg font-bold text-gray-900">{company.categories.environment}</p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-gray-600">การดูแล</p>
                                                    <p className="text-lg font-bold text-gray-900">{company.categories.supervision}</p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-gray-600">การเรียนรู้</p>
                                                    <p className="text-lg font-bold text-gray-900">{company.categories.learning}</p>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg">
                                                    <p className="text-sm text-gray-600">สิ่งอำนวยความสะดวก</p>
                                                    <p className="text-lg font-bold text-gray-900">{company.categories.facilities}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}