
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { userRoleGroups, UserRoleGroup } from '@/lib/data';

type TitleRow = {
  id: string;
  nameTh: string;
  nameEn: string;
  applicableTo: UserRoleGroup[];
  isActive?: boolean;
};

export function TitleManagement() {
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/titles', { method: 'GET' });
        const data = await res.json();
        if (!ignore && data?.success) {
          setTitles(data.data as TitleRow[]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);
  
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

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(titles.map(t => ({
          id: t.id?.startsWith('title-') ? undefined : t.id,
          nameTh: t.nameTh,
          nameEn: t.nameEn || null,
          applicableTo: t.applicableTo,
          isActive: t.isActive !== false,
        })))
      });
      const data = await res.json();
      if (data?.success) {
        setTitles(data.data as TitleRow[]);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteTitle = async (id: string) => {
    // Optimistic remove
    const prev = titles;
    setTitles(titles.filter(t => t.id !== id));
    try {
      const res = await fetch(`/api/titles?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        setTitles(prev);
      }
    } catch {
      setTitles(prev);
    }
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
              {(loading ? [] : titles).map((title) => (
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
                    <Button variant="ghost" size="icon" onClick={() => (title.id?.startsWith('title-') ? handleRemoveTitle(title.id) : deleteTitle(title.id))}>
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
          <Button onClick={saveAll} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
