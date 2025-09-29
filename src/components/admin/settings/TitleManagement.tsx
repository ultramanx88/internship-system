
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { titles as initialTitles, userRoleGroups } from '@/lib/data';
import type { UserTitle, UserRoleGroup } from '@/lib/types';

export function TitleManagement() {
  const [titles, setTitles] = useState<UserTitle[]>(initialTitles);
  
  const handleAddTitle = () => {
    setTitles([
      ...titles,
      {
        id: `title-${Date.now()}`,
        nameTh: '',
        nameEn: '',
        applicableTo: [],
      },
    ]);
  };
  
  const handleRemoveTitle = (id: string) => {
    setTitles(titles.filter(t => t.id !== id));
  };
  
  const handleTitleChange = (id: string, field: 'nameTh' | 'nameEn', value: string) => {
    setTitles(titles.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handlePermissionChange = (titleId: string, roleGroupId: UserRoleGroup, checked: boolean) => {
    setTitles(titles.map(title => {
        if (title.id === titleId) {
            const applicableTo = new Set(title.applicableTo);
            if (checked) {
                applicableTo.add(roleGroupId);
            } else {
                applicableTo.delete(roleGroupId);
            }
            return { ...title, applicableTo: Array.from(applicableTo) };
        }
        return title;
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการคำนำหน้าชื่อ</CardTitle>
        <CardDescription>
          เพิ่ม ลบ และกำหนดสิทธิ์การใช้งานคำนำหน้าชื่อสำหรับกลุ่มผู้ใช้ต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">คำนำหน้า (ไทย)</TableHead>
                <TableHead className="w-[200px]">คำนำหน้า (อังกฤษ)</TableHead>
                {userRoleGroups.map(group => (
                    <TableHead key={group.id} className="text-center">{group.label}</TableHead>
                ))}
                <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {titles.map((title) => (
                <TableRow key={title.id}>
                  <TableCell>
                    <Input 
                      value={title.nameTh}
                      onChange={(e) => handleTitleChange(title.id, 'nameTh', e.target.value)}
                      placeholder="เช่น นาย"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={title.nameEn}
                      onChange={(e) => handleTitleChange(title.id, 'nameEn', e.target.value)}
                      placeholder="e.g. Mr."
                    />
                  </TableCell>
                  {userRoleGroups.map(group => (
                    <TableCell key={group.id} className="text-center">
                        <Checkbox
                            checked={title.applicableTo.includes(group.id)}
                            onCheckedChange={(checked) => handlePermissionChange(title.id, group.id, !!checked)}
                        />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTitle(title.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleAddTitle}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มคำนำหน้าชื่อ
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
