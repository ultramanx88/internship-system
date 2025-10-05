'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { StaffGuard } from '@/components/auth/PermissionGuard';

export default function StaffDashboardPage() {
    // ข้อมูลสำหรับ Pie Chart
    const chartData = [
        { name: 'เอกสารผ่านแล้ว', value: 60, color: '#3B82F6' },
        { name: 'รอการตรวจสอบ', value: 20, color: '#F59E0B' },
        { name: 'ต้องแก้ไขเอกสาร', value: 20, color: '#F87171' }
    ];

    // Custom label function for pie chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 30; // Position labels outside the pie
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <g>
                {/* White circle background */}
                <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                />
                {/* Percentage text */}
                <text
                    x={x}
                    y={y}
                    fill="#374151"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={14}
                    fontWeight="600"
                >
                    {`${value}%`}
                </text>
            </g>
        );
    };

    // Timeline ขั้นตอนการยื่นสหกิจศึกษา
    const coopTimeline = [
        {
            step: 1,
            title: 'กรอกข้อมูลสหกิจศึกษา',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'completed'
        },
        {
            step: 2,
            title: 'ยื่นเอกสาร ณ ห้องธุรการชั้น 4',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'completed'
        },
        {
            step: 3,
            title: 'ยื่นเอกสารให้กับทางบริษัท',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'current'
        },
        {
            step: 4,
            title: 'สหกิจศึกษา',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'upcoming'
        },
        {
            step: 5,
            title: 'กรอกข้อมูลโปรเจกต์',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'upcoming'
        }
    ];

    return (
        <StaffGuard>
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">หน้าแรก</h1>
                <p className="text-muted-foreground">
                    ยินดีต้อนรับ! ภาพรวมการทำงานของเจ้าหน้าที่ธุรการ
                </p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* คอลัมน์ซ้าย 2/3 - มี 3 แถว */}
                <div className="lg:col-span-2 space-y-6">
                    {/* แถวที่ 1: กำหนดการใกล้ถึง */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">กำหนดการใกล้ถึง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* กลุ่มวันที่ 11 มี.ค. 2568 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 pt-3">
                                        11 มี.ค. 2568
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-700">9:00 - 16:30</span>
                                                <span className="text-sm text-gray-900">ยื่นเอกสาร ณ ห้องธุรการชั้น 4</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">ธุรการ</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-700">9:00 - 16:30</span>
                                                <span className="text-sm text-gray-900">ยื่นเอกสาร ณ ห้องธุรการชั้น 4</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">ธุรการ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* เส้นแบ่ง */}
                            <div className="border-t border-gray-200 my-4"></div>

                            {/* กลุ่มวันที่ 24 ก.ค. 2568 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 pt-3">
                                        24 ก.ค. 2568
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-700">9:00 - 16:30</span>
                                                <span className="text-sm text-gray-900">อาจารย์ตรวจเยี่ยมสหกิจศึกษา</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">อจ.ภาคสี</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* แถวที่ 2: จำนวนนักศึกษาที่ส่งเอกสารฝึกงาน */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">จำนวนนักศึกษาที่ส่งเอกสารฝึกงาน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <div className="w-96 h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-6 space-y-3">
                                {chartData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            ></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* แถวที่ 3: การแจ้งเตือน */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">การแจ้งเตือน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium text-orange-800">แอดมินตั้งรับรับใบสมัครรอบวันที่ 10 / 06 / 69</p>
                                        <p className="text-sm text-orange-600">5 มิถุนายน 2568 14:00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-800">ครบกระบวนการส่งเอกสารเพิ่มเติม 20 คน</p>
                                        <p className="text-sm text-blue-600">5 มิถุนายน 2568 13:00</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* คอลัมน์ขวา 1/3 - Timeline ยาวลงมาตลอด */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">ขั้นตอนการยื่นสหกิจศึกษา</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {coopTimeline.map((item, index) => (
                                <div key={index} className="relative flex items-start pb-8 last:pb-0">
                                    {/* เส้นเชื่อม */}
                                    {index < coopTimeline.length - 1 && (
                                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-orange-200" />
                                    )}

                                    {/* หมายเลขขั้นตอน */}
                                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${item.status === 'completed' ? 'bg-orange-500 text-white' :
                                        item.status === 'current' ? 'bg-orange-300 text-orange-800' :
                                            'bg-orange-100 text-orange-400'
                                        }`}>
                                        {item.status === 'completed' ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            item.step
                                        )}
                                    </div>

                                    {/* เนื้อหา */}
                                    <div className="ml-3 flex-1">
                                        <h3 className={`font-medium text-xs ${item.status === 'current' ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        </StaffGuard>
    );
}