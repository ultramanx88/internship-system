'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, Building, FileText, Award, Download, Calendar } from 'lucide-react';

export default function SummaryPage() {
    // Sample data for trends
    const trendData = [
        { month: 'ม.ค.', students: 45, companies: 12, satisfaction: 4.2 },
        { month: 'ก.พ.', students: 52, companies: 14, satisfaction: 4.1 },
        { month: 'มี.ค.', students: 38, companies: 11, satisfaction: 4.3 },
        { month: 'เม.ย.', students: 61, companies: 16, satisfaction: 4.4 },
        { month: 'พ.ค.', students: 49, companies: 13, satisfaction: 4.2 },
        { month: 'มิ.ย.', students: 67, companies: 18, satisfaction: 4.5 }
    ];

    const departmentData = [
        { name: 'วิทยาการคอมพิวเตอร์', students: 89, percentage: 26, trend: 'up' },
        { name: 'เทคโนโลยีสารสนเทศ', students: 76, percentage: 22, trend: 'up' },
        { name: 'วิศวกรรมซอฟต์แวร์', students: 65, percentage: 19, trend: 'down' },
        { name: 'ระบบสารสนเทศ', students: 58, percentage: 17, trend: 'up' },
        { name: 'เทคโนโลยีมัลติมีเดีย', students: 54, percentage: 16, trend: 'up' }
    ];

    const achievements = [
        {
            title: 'นักศึกษาได้รับรางวัลดีเด่น',
            count: 23,
            description: 'จากสถานประกอบการต่างๆ',
            icon: Award,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            title: 'โครงการพิเศษที่สำเร็จ',
            count: 15,
            description: 'โครงการที่ได้รับการยอมรับ',
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'สถานประกอบการใหม่',
            count: 8,
            description: 'เพิ่มขึ้นในภาคการศึกษานี้',
            icon: Building,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">รายงานสรุปผลการ</h1>
                        <p className="text-gray-600 mt-2">ภาพรวมและสรุปผลการดำเนินงานทั้งหมด</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            เลือกช่วงเวลา
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออกรายงาน
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">นักศึกษาทั้งหมด</p>
                                    <p className="text-3xl font-bold">342</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">+15.2%</span>
                                    </div>
                                </div>
                                <Users className="h-12 w-12 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">สถานประกอบการ</p>
                                    <p className="text-3xl font-bold">67</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">+8 แห่ง</span>
                                    </div>
                                </div>
                                <Building className="h-12 w-12 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">อัตราความสำเร็จ</p>
                                    <p className="text-3xl font-bold">94.2%</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">+2.1%</span>
                                    </div>
                                </div>
                                <Award className="h-12 w-12 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100">ความพึงพอใจ</p>
                                    <p className="text-3xl font-bold">4.35</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">+0.15</span>
                                    </div>
                                </div>
                                <FileText className="h-12 w-12 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trends Chart */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            แนวโน้มการเติบโต (6 เดือนที่ผ่านมา)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area 
                                    type="monotone" 
                                    dataKey="students" 
                                    stackId="1" 
                                    stroke="#3B82F6" 
                                    fill="#3B82F6" 
                                    fillOpacity={0.6}
                                    name="นักศึกษา"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="companies" 
                                    stackId="2" 
                                    stroke="#10B981" 
                                    fill="#10B981" 
                                    fillOpacity={0.6}
                                    name="สถานประกอบการ"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Statistics */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">
                                สถิติตามสาขาวิชา
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {departmentData.map((dept, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{dept.name}</span>
                                                {dept.trend === 'up' ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">{dept.students}</span>
                                                <span className="text-sm text-gray-500 ml-1">คน</span>
                                            </div>
                                        </div>
                                        <Progress value={dept.percentage} className="h-2" />
                                        <p className="text-xs text-gray-500">{dept.percentage}% ของนักศึกษาทั้งหมด</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">
                                ความสำเร็จที่โดดเด่น
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className={`p-3 rounded-full ${achievement.bgColor}`}>
                                            <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                                                <Badge className="bg-amber-100 text-amber-700">
                                                    {achievement.count}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            การดำเนินการด่วน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <h4 className="font-semibold text-red-800">ต้องดำเนินการด่วน</h4>
                                </div>
                                <p className="text-sm text-red-700 mb-3">18 เอกสารรอการตรวจสอบ</p>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                    ดำเนินการ
                                </Button>
                            </div>

                            <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <h4 className="font-semibold text-yellow-800">กำลังดำเนินการ</h4>
                                </div>
                                <p className="text-sm text-yellow-700 mb-3">25 รายการอยู่ระหว่างประมวลผล</p>
                                <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700">
                                    ติดตาม
                                </Button>
                            </div>

                            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <h4 className="font-semibold text-green-800">เสร็จสิ้นแล้ว</h4>
                                </div>
                                <p className="text-sm text-green-700 mb-3">156 รายการดำเนินการสำเร็จ</p>
                                <Button size="sm" variant="outline" className="border-green-600 text-green-700">
                                    ดูรายละเอียด
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}