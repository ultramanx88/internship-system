'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
    FileText,
    BookOpen,
    MapPin,
    Building,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { ApplicationWorkflow } from '@/components/student/ApplicationWorkflow';

interface DashboardData {
    user: {
        id: string;
        name: string;
        email: string;
        roles: string[];
    };
    applications: any[];
    approvedApplication: any;
    upcomingDeadlines: any[];
    recentActivities: any[];
    stats: {
        totalApplications: number;
        approvedApplications: number;
        pendingApplications: number;
        completedApplications: number;
    };
}

export default function StudentPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/student/dashboard', {
                    headers: {
                        'x-user-id': user.id,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const result = await response.json();
                if (result.success) {
                    setDashboardData(result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">เกิดข้อผิดพลาด: {error}</p>
                    <Button onClick={() => window.location.reload()}>
                        ลองใหม่
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">ไม่พบข้อมูล</p>
                </div>
            </div>
        );
    }

    const { applications, approvedApplication, upcomingDeadlines, recentActivities, stats } = dashboardData;

    // Get approved internship and company data
    const approvedInternship = approvedApplication?.internship;
    const approvedCompany = approvedInternship?.company;

    // Coop timeline data
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
            status: 'current'
        },
        {
            step: 3,
            title: 'ยื่นเอกสารให้กับทางบริษัท',
            date: '7 มี.ค. 68 - 19 มี.ค. 68',
            status: 'upcoming'
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">หน้าแรก</h1>
                <p className="text-muted-foreground">
                    ยินดีต้อนรับ, {dashboardData.user.name}! ติดตามความคืบหน้าการฝึกงาน/สหกิจศึกษาของคุณ
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

                    {/* แถวที่ 2: สถานะการยื่นขอฝึกงานของฉัน */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">สถานะการยื่นขอฝึกงานของฉัน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.map((app) => (
                                        <div key={app.id} className="p-4 bg-orange-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-8">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        เอกสาร {app.id}
                                                    </span>
                                                    <span className="text-sm text-gray-900">
                                                        {app.status === 'approved' ? 'อนุมัติแล้วจากการพิจารณา' :
                                                         app.status === 'pending' ? 'รอการพิจารณา' :
                                                         app.status === 'rejected' ? 'ไม่ผ่านการพิจารณา' :
                                                         'สถานะไม่ทราบ'}
                                                    </span>
                                                </div>
                                                <Badge variant={app.status === 'approved' ? 'default' : 
                                                              app.status === 'pending' ? 'secondary' : 
                                                              'destructive'}>
                                                    {app.status === 'approved' ? 'อนุมัติ' :
                                                     app.status === 'pending' ? 'รอพิจารณา' :
                                                     app.status === 'rejected' ? 'ไม่ผ่าน' : app.status}
                                                </Badge>
                                            </div>
                                            {app.internship && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4" />
                                                        <span>{app.internship.title} - {app.internship.company?.name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">ยังไม่มีการยื่นขอฝึกงาน</p>
                                    <Button asChild className="mt-4">
                                        <Link href="/student/application-form">ยื่นขอฝึกงาน</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* แถวที่ 3: รายละเอียดโปรเจกต์ของฉัน */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">รายละเอียดโปรเจกต์ของฉัน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {approvedApplication && approvedInternship ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <h3 className="font-semibold text-orange-800 mb-2">
                                            {approvedInternship.title}
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-orange-700">
                                                <Building className="h-4 w-4" />
                                                <span>{approvedCompany?.name || 'ไม่ระบุบริษัท'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-orange-700">
                                                <User className="h-4 w-4" />
                                                <span>ผู้ดูแล: {approvedApplication.supervisor?.name || 'ไม่ระบุผู้ดูแล'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-orange-700">
                                                <MapPin className="h-4 w-4" />
                                                <span>{approvedCompany?.address || 'ไม่ระบุที่อยู่'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p><strong>คำอธิบายโดยสังเขป:</strong></p>
                                        <p>{approvedApplication.projectTopic || approvedInternship.description || 'ไม่ระบุรายละเอียดโปรเจกต์'}</p>
                                    </div>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/student/project-details">ดูรายละเอียดเพิ่มเติม</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">ยังไม่มีโปรเจกต์</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        โปรเจกต์จะแสดงหลังจากได้รับการอนุมัติ
                                    </p>
                                </div>
                            )}
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
    );
}