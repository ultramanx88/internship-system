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
        approved: "bg-[#2f7b69] text-white",
        pending: "bg-[#f4a79d] text-secondary-foreground",
        rejected: "bg-[#a01f38] text-white",
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
    
    const statusTranslations: { [key: string]: string } = {
      approved: "อนุมัติ",
      pending: "รอการตรวจสอบ",
      rejected: "ปฏิเสธ",
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">แดชบอร์ดผู้ดูแลระบบ</h1>
                <p>ภาพรวมโปรแกรมการฝึกงานทั้งหมดในที่เดียว</p>
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
                    <TableRow className="bg-primary-600 hover:bg-primary-600">
                        <TableHead className="text-white">นักเรียน</TableHead>
                        <TableHead className="text-white">การฝึกงาน</TableHead>
                        <TableHead className="text-white">วันที่สมัคร</TableHead>
                        <TableHead className="text-right text-white">สถานะ</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {tableData.map(app => (
                        <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell>{app.internshipTitle}</TableCell>
                        <TableCell>{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <Badge className={`capitalize ${statusColors[app.status]}`}>
                                {statusTranslations[app.status]}
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
