import { applications, users, internships } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function TeacherPage() {
  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ดอาจารย์</h1>
        <p className="text-muted-foreground">ตรวจสอบและจัดการใบสมัครฝึกงานของนักเรียน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ใบสมัครที่รอการตรวจสอบ</CardTitle>
          <CardDescription>ใบสมัครเหล่านี้กำลังรอการตรวจสอบจากคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>นักเรียน</TableHead>
                <TableHead>การฝึกงาน</TableHead>
                <TableHead>วันที่สมัคร</TableHead>
                <TableHead className="text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApplications.length > 0 ? (
                pendingApplications.map(app => {
                  const student = users.find(u => u.id === app.studentId);
                  const internship = internships.find(i => i.id === app.internshipId);
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{student?.name}</TableCell>
                      <TableCell>{internship?.title}</TableCell>
                      <TableCell>{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/teacher/${app.id}`}>ตรวจสอบ</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    ไม่มีใบสมัครที่รอการตรวจสอบ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
