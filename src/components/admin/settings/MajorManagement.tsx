
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { majors as initialMajors } from '@/lib/data';
import type { Major } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function MajorManagement() {
  const [majors, setMajors] = useState<Major[]>(initialMajors);

  const majorGroups = useMemo(() => {
    const topLevelMajors = majors.filter(m => !m.parentId);
    const grouped = topLevelMajors.map(major => ({
      ...major,
      minors: majors.filter(m => m.parentId === major.id)
    }));
    return grouped;
  }, [majors]);

  const handleAddMajor = () => {
    setMajors(prev => [
      ...prev,
      {
        id: `major-${Date.now()}`,
        nameTh: '',
        nameEn: '',
        parentId: null,
      },
    ]);
  };
  
  const handleAddMinor = (majorId: string) => {
     setMajors(prev => [
      ...prev,
      {
        id: `minor-${Date.now()}`,
        nameTh: '',
        nameEn: '',
        parentId: majorId,
      },
    ]);
  }

  const handleRemove = (id: string) => {
    // Also remove children
    const idsToRemove = [id, ...majors.filter(m => m.parentId === id).map(m => m.id)];
    setMajors(prev => prev.filter(m => !idsToRemove.includes(m.id)));
  };
  
  const handleMajorChange = (id: string, field: 'nameTh' | 'nameEn', value: string) => {
    setMajors(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการวิชาเอก / วิชาโท</CardTitle>
        <CardDescription>
          เพิ่ม, ลบ, และแก้ไขวิชาเอกและวิชาโทที่เกี่ยวข้อง
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อวิชา (ไทย)</TableHead>
                <TableHead>ชื่อวิชา (อังกฤษ)</TableHead>
                <TableHead className="w-[120px] text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majorGroups.map(group => (
                <React.Fragment key={group.id}>
                    {/* Major Row */}
                    <TableRow className="bg-muted/50">
                       <TableCell className="font-semibold">
                          <Input 
                            value={group.nameTh}
                            onChange={(e) => handleMajorChange(group.id, 'nameTh', e.target.value)}
                            placeholder="เช่น เทคโนโลยีสารสนเทศ"
                            className="font-semibold border-0 bg-transparent"
                            />
                       </TableCell>
                       <TableCell>
                           <Input 
                            value={group.nameEn}
                            onChange={(e) => handleMajorChange(group.id, 'nameEn', e.target.value)}
                            placeholder="e.g. Information Technology"
                            className="border-0 bg-transparent"
                            />
                       </TableCell>
                       <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleAddMinor(group.id)}>
                            เพิ่มวิชาโท
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleRemove(group.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                       </TableCell>
                    </TableRow>
                    
                    {/* Minor Rows */}
                    {group.minors.map(minor => (
                        <TableRow key={minor.id}>
                            <TableCell className="pl-12">
                                <Input 
                                    value={minor.nameTh}
                                    onChange={(e) => handleMajorChange(minor.id, 'nameTh', e.target.value)}
                                    placeholder="ชื่อวิชาโท"
                                    className="border-0"
                                />
                            </TableCell>
                            <TableCell>
                                <Input 
                                    value={minor.nameEn}
                                    onChange={(e) => handleMajorChange(minor.id, 'nameEn', e.target.value)}
                                    placeholder="Minor name"
                                    className="border-0"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleRemove(minor.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleAddMajor}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มวิชาเอก
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
