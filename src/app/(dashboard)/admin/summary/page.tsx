'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart, Users, Building, CheckCircle } from 'lucide-react';

export default function AdminSummaryPage() {
  // Mock data for summary, in a real app this would be fetched
  const summaryData = {
    totalStudents: 22,
    totalCompanies: 15,
    totalApplications: 50,
    approvedRate: 85,
  };

  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">รายงานสรุป</h1>
        <p>ภาพรวมและข้อมูลสรุปของโปรแกรมการฝึกงานทั้งหมด</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">คนที่เข้าร่วมโปรแกรม</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สถานประกอบการ</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalCompanies}</div>
             <p className="text-xs text-muted-foreground">บริษัทที่เข้าร่วม</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใบสมัครทั้งหมด</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalApplications}</div>
            <p className="text-xs text-muted-foreground">จำนวนใบสมัครที่ส่ง</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการอนุมัติ</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.approvedRate}%</div>
             <p className="text-xs text-muted-foreground">จากใบสมัครทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ดาวน์โหลดรายงาน</CardTitle>
          <CardDescription>
            คุณสามารถดาวน์โหลดรายงานสรุปในรูปแบบต่างๆ ได้
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดรายงานสรุป (PDF)
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดข้อมูลนักศึกษา (Excel)
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดข้อมูลบริษัท (Excel)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
