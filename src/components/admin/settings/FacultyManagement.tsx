
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Save, Trash2, Loader2 } from 'lucide-react';
import type { Faculty } from '@/lib/types';

export function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    async function fetchFaculties() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/faculties');
        if (!response.ok) {
          throw new Error('Failed to fetch faculties');
        }
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error(error);
        // Handle error display to user
      } finally {
        setIsLoading(false);
      }
    }
    fetchFaculties();
  }, []);

  const handleAddFaculty = () => {
    setFaculties([
      ...faculties,
      {
        id: `new-${Date.now()}`, // Temporary ID for new items
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faculties),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const updatedData = await response.json();
      setFaculties(updatedData.data);
      alert('บันทึกการเปลี่ยนแปลงสำเร็จ!');

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการคณะ</CardTitle>
        <CardDescription>
          เพิ่ม, ลบ, และแก้ไขรายชื่อคณะในระบบ (ใช้ข้อมูลจำลอง)
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    กำลังโหลดข้อมูล...
                  </TableCell>
                </TableRow>
              ) : faculties.map((faculty) => (
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
          <Button variant="outline" size="sm" onClick={handleAddFaculty} disabled={isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มคณะ
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
