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
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import { Badge } from '@/components/ui/badge';

export default async function AdminPage() {
    const statusColors: { [key: string]: string } = {
        approved: "bg-green-100 text-green-800 border-green-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const tableData = applications.map(app => {
        const student = users.find(u => u.id === app.studentId);
        const internship = internships.find(i => i.id === app.internshipId);
        return {
            ...app,
            studentName: student?.name || 'N/A',
            internshipTitle: internship?.title || 'N/A',
        };
    });

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
                <p className="text-muted-foreground">ภาพรวมโปรแกรมการฝึกงานทั้งหมดในที่เดียว</p>
            </div>

            <AdminDashboard applications={applications} />

            <Card>
                <CardHeader>
                    <CardTitle>ใบสมัครทั้งหมด</CardTitle>
                    <CardDescription>บันทึกใบสมัครของนักเรียนทั้งหมด</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>นักเรียน</TableHead>
                        <TableHead>การฝึกงาน</TableHead>
                        <TableHead>วันที่สมัคร</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {tableData.map(app => (
                        <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell>{app.internshipTitle}</TableCell>
                        <TableCell>{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="outline" className={`capitalize ${statusColors[app.status]}`}>
                                {app.status === 'approved' ? 'อนุมัติ' : app.status === 'pending' ? 'รอการตรวจสอบ' : 'ปฏิเสธ'}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    );
}
