'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { applications, internships } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Eye, XCircle } from 'lucide-react';
import { formatThaiDateLong } from '@/lib/date-utils';

const statusIcons: { [key: string]: React.ReactNode } = {
  approved: <CheckCircle className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const statusColors: { [key: string]: string } = {
    approved: "bg-success text-white",
    pending: "bg-amber-500 text-white",
    rejected: "bg-destructive text-destructive-foreground",
};

const statusTranslations: { [key: string]: string } = {
  approved: "อนุมัติ",
  pending: "รอการตรวจสอบ",
  rejected: "ปฏิเสธ",
};

export default function StudentApplicationsPage() {
  const { user } = useAuth();
  
  const myApplications = useMemo(() => {
    if (!user) return [];
    return applications
      .filter(app => app.studentId === user.id)
      .map(app => ({
          ...app,
          internship: internships.find(i => i.id === app.internshipId)
      }))
      .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
  }, [user]);

  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ใบสมัครของฉัน</h1>
        <p>ติดตามสถานะใบสมัครฝึกงานและสหกิจศึกษาทั้งหมดของคุณ</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการสมัคร</CardTitle>
          <CardDescription>รายการสมัครงานทั้งหมดที่คุณได้ส่งไป</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-600 hover:bg-primary-600">
                  <TableHead className="text-white">ตำแหน่ง</TableHead>
                  <TableHead className="text-white">บริษัท</TableHead>
                  <TableHead className="text-white">วันที่สมัคร</TableHead>
                  <TableHead className="text-center text-white">สถานะ</TableHead>
                  <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myApplications.length > 0 ? (
                  myApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.internship?.title}</TableCell>
                      <TableCell>Company ID: {app.internship?.companyId}</TableCell>
                      <TableCell>{formatThaiDateLong(new Date(app.dateApplied))}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`capitalize ${statusColors[app.status]}`}>
                            {statusIcons[app.status]}
                            <span className="ml-2">{statusTranslations[app.status]}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/student/internships/${app.internshipId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      คุณยังไม่ได้ส่งใบสมัครใดๆ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
