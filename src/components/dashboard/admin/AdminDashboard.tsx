'use client';

import { Application } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type AdminDashboardProps = {
  applications: Omit<Application, 'createdAt' | 'updatedAt'>[];
};

export default function AdminDashboard({ applications }: AdminDashboardProps) {
  const totalApps = applications.length;
  const pendingApps = applications.filter(app => app.status === 'pending').length;
  const approvedApps = applications.filter(app => app.status === 'approved').length;
  const rejectedApps = applications.filter(app => app.status === 'rejected').length;

  const chartData = [
    { name: 'สถานะ', pending: pendingApps, approved: approvedApps, rejected: rejectedApps },
  ];
  
  const chartConfig = {
    approved: {
      label: 'อนุมัติ',
      color: 'hsl(var(--chart-approved))',
    },
    pending: {
      label: 'รอตรวจสอบ',
      color: 'hsl(var(--chart-pending))',
    },
    rejected: {
      label: 'ปฏิเสธ',
      color: 'hsl(var(--chart-rejected))',
    },
  } satisfies ChartConfig;
  
  const approvalRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(0) : 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใบสมัครทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApps}</div>
            <p className="text-xs text-muted-foreground">ใบสมัครในระบบทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการตรวจสอบ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps}</div>
            <p className="text-xs text-muted-foreground">ที่ต้องดำเนินการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedApps}</div>
             <p className="text-xs text-muted-foreground">จากใบสมัครทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการอนุมัติ</CardTitle>
            <div className="h-4 w-4 text-success font-bold">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">เทียบกับใบสมัครทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ภาพรวมสถานะใบสมัคร</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
               <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                className="fill-muted-foreground"
              />
              <XAxis dataKey="count" type="number" hide />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent hideLabel />} />
               <Legend />
              <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[0, 4, 4, 0]} />
               <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
