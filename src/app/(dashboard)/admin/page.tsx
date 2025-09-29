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
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Oversee the entire internship program at a glance.</p>
            </div>

            <AdminDashboard applications={applications} />

            <Card>
                <CardHeader>
                    <CardTitle>All Applications</CardTitle>
                    <CardDescription>A complete log of all student applications.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Internship</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead className="text-right">Status</TableHead>
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
                                {app.status}
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
