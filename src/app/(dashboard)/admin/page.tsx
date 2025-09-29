import { Application } from '@prisma/client';
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
import { users, internships } from '@/lib/data';

async function getApplications() {
    // In a real app, you'd fetch from your API endpoint.
    // For now, we'll simulate it by returning the mock data.
    // To see the real implementation, you would use:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/applications`, { cache: 'no-store' });
    // if (!res.ok) {
    //   throw new Error('Failed to fetch applications');
    // }
    // return res.json();
    const { applications } = await import('@/lib/data');
    return applications;
}


export default async function AdminPage() {
    const applications: Omit<Application, "createdAt" | "updatedAt">[] = await getApplications();
    
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
                    <CardTitle>ใบสมัครล่าสุด</CardTitle>
                    <CardDescription>ภาพรวม 10 ใบสมัครล่าสุด</CardDescription>
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
                    {tableData.slice(0, 10).map(app => (
                        <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell>{app.internshipTitle}</TableCell>
                        <TableCell>{new Date(app.dateApplied).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
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
