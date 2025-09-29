'use client';

import type { Application } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

type AdminDashboardProps = {
  applications: Application[];
};

export default function AdminDashboard({ applications }: AdminDashboardProps) {
  const totalApps = applications.length;
  const pendingApps = applications.filter(app => app.status === 'pending').length;
  const approvedApps = applications.filter(app => app.status === 'approved').length;
  const rejectedApps = applications.filter(app => app.status === 'rejected').length;

  const chartData = [
    { name: 'รอตรวจสอบ', count: pendingApps, fill: 'var(--color-pending)' },
    { name: 'อนุมัติ', count: approvedApps, fill: 'var(--color-approved)' },
    { name: 'ปฏิเสธ', count: rejectedApps, fill: 'var(--color-rejected)' },
  ];
  
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedApps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการตรวจสอบ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการอนุมัติ</CardTitle>
            <div className="h-4 w-4 text-green-500 font-bold">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ภาพรวมสถานะใบสมัคร</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <style>
              {`
                :root {
                    --color-pending: #F4A79D;
                    --color-approved: #2F7B69;
                    --color-rejected: #A01F38;
                }
                .dark {
                    --color-pending: #F4A79D;
                    --color-approved: #2F7B69;
                    --color-rejected: #A01F38;
                }
              `}
            </style>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--card-foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
