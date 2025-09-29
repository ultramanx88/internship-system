
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { majors as initialMajors } from '@/lib/data';
import type { Major } from '@/lib/types';

export function MajorManagement() {
  const [majors, setMajors] = useState<Major[]>(initialMajors);
  
  const handleAddMajor = () => {
    setMajors([
      ...majors,
      {
        id: `major-${Date.now()}`,
        name: '',
        type: 'major',
      },
    ]);
  };
  
  const handleRemoveMajor = (id: string) => {
    setMajors(majors.filter(m => m.id !== id));
  };
  
  const handleMajorChange = (id: string, field: 'name' | 'type', value: string) => {
    setMajors(majors.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const moveMajor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === majors.length - 1) return;

    const newMajors = [...majors];
    const item = newMajors.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newMajors.splice(newIndex, 0, item);
    setMajors(newMajors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการวิชาเอก / วิชาโท</CardTitle>
        <CardDescription>
          เพิ่ม, ลบ, แก้ไข, และจัดลำดับวิชาเอกและวิชาโทในระบบ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">จัดลำดับ</TableHead>
                <TableHead>ชื่อวิชา</TableHead>
                <TableHead className="w-[180px]">ประเภท</TableHead>
                <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majors.map((major, index) => (
                <TableRow key={major.id}>
                  <TableCell className="flex gap-1">
                     <Button variant="ghost" size="icon" onClick={() => moveMajor(index, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveMajor(index, 'down')} disabled={index === majors.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={major.name}
                      onChange={(e) => handleMajorChange(major.id, 'name', e.target.value)}
                      placeholder="เช่น เทคโนโลยีสารสนเทศ"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                        value={major.type}
                        onValueChange={(value) => handleMajorChange(major.id, 'type', value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="major">วิชาเอก</SelectItem>
                            <SelectItem value="minor">วิชาโท</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMajor(major.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleAddMajor}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มรายวิชา
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
