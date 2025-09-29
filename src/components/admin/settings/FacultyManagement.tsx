
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { faculties as initialFaculties } from '@/lib/data';
import type { Faculty } from '@/lib/types';

export function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties);
  
  const handleAddFaculty = () => {
    setFaculties([
      ...faculties,
      {
        id: `faculty-${Date.now()}`,
        nameTh: '',
        nameEn: '',
      },
    ]);
  };
  
  const handleRemoveFaculty = (id: string) => {
    setFaculties(faculties.filter(f => f.id !== id));
  };
  
  const handleFacultyChange = (id: string, field: 'nameTh' | 'nameEn', value: string) => {
    setFaculties(faculties.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการคณะ</CardTitle>
        <CardDescription>
          เพิ่ม, ลบ, และแก้ไขรายชื่อคณะในระบบ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อคณะ (ไทย)</TableHead>
                <TableHead>ชื่อคณะ (อังกฤษ)</TableHead>
                <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell>
                    <Input 
                      value={faculty.nameTh}
                      onChange={(e) => handleFacultyChange(faculty.id, 'nameTh', e.target.value)}
                      placeholder="เช่น คณะเทคโนโลยีสารสนเทศ"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={faculty.nameEn}
                      onChange={(e) => handleFacultyChange(faculty.id, 'nameEn', e.target.value)}
                      placeholder="e.g. School of Information Technology"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFaculty(faculty.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleAddFaculty}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มคณะ
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
