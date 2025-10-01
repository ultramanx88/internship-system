'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Users, FileText, BarChart2 } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
                <p className="text-muted-foreground">จัดการระบบฝึกงานและสหกิจศึกษา</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">จัดการผู้ใช้</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">จัดการ</div>
                        <p className="text-xs text-muted-foreground">ผู้ใช้ในระบบ</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link href="/admin/users">เข้าสู่หน้าจัดการ</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">สถานประกอบการ</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">จัดการ</div>
                        <p className="text-xs text-muted-foreground">ข้อมูลบริษัท</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link href="/admin/companies">เข้าสู่หน้าจัดการ</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ใบสมัคร</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">จัดการ</div>
                        <p className="text-xs text-muted-foreground">ใบสมัครฝึกงาน</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link href="/admin/applications">เข้าสู่หน้าจัดการ</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รายงาน</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ดู</div>
                        <p className="text-xs text-muted-foreground">รายงานสรุป</p>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link href="/admin/reports">เข้าสู่หน้าจัดการ</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>ข้อมูลระบบ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p>✅ ระบบจัดการผู้ใช้ - พร้อมใช้งาน</p>
                        <p>✅ ระบบจัดการสถานประกอบการ - พร้อมใช้งาน</p>
                        <p>🔄 ระบบใบสมัคร - กำลังพัฒนา</p>
                        <p>🔄 ระบบรายงาน - กำลังพัฒนา</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
