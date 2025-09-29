'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { applications, companyEvaluations, internships } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit, Star } from 'lucide-react';

export default function StudentEvaluationPage() {
  const { user } = useAuth();
  
  const evaluations = useMemo(() => {
    if (!user) return [];
    
    // Find approved applications for the current student
    const studentApprovedApps = applications.filter(app => app.studentId === user.id && app.status === 'approved');
    
    // Map them to evaluation data
    return studentApprovedApps.map(app => {
        const evaluationData = companyEvaluations.find(e => e.internshipId === app.internshipId);
        const internshipData = internships.find(i => i.id === app.internshipId);
        
        return {
            ...evaluationData,
            companyName: internshipData?.company || 'Unknown Company',
            internshipId: app.internshipId,
        };
    });
  }, [user]);

  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ประเมินสถานประกอบการ</h1>
        <p>ประเมินและให้ข้อเสนอแนะเกี่ยวกับประสบการณ์การฝึกงานของคุณ</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายการประเมิน</CardTitle>
          <CardDescription>เลือกสถานประกอบการที่คุณต้องการประเมิน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-600 hover:bg-primary-600">
                  <TableHead className="text-white">ชื่อสถานประกอบการ</TableHead>
                  <TableHead className="text-center text-white">สถานะ</TableHead>
                  <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.length > 0 ? (
                  evaluations.map((item) => (
                    <TableRow key={item.internshipId}>
                      <TableCell className="font-medium">{item.companyName}</TableCell>
                      <TableCell className="text-center">
                        {item.isEvaluated ? (
                          <Badge className="bg-success text-white">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            ประเมินแล้ว
                          </Badge>
                        ) : (
                          <Badge variant="secondary">ยังไม่ได้ประเมิน</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/student/evaluation/${item.internshipId}`}>
                            {item.isEvaluated ? <Edit className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                            {item.isEvaluated ? 'แก้ไขการประเมิน' : 'ทำแบบประเมิน'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      ไม่มีรายการฝึกงานที่ได้รับการอนุมัติให้ประเมิน
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
