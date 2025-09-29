'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { roles, modules, initialPermissions } from '@/lib/permissions';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Save } from 'lucide-react';

export function RoleManagementMatrix() {
  const [permissions, setPermissions] = useState(initialPermissions);

  const handlePermissionChange = (roleId: string, moduleId: string, checked: boolean) => {
    setPermissions(prev => {
      const currentPermissions = new Set(prev[roleId as keyof typeof prev]);
      if (checked) {
        currentPermissions.add(moduleId);
      } else {
        currentPermissions.delete(moduleId);
      }
      return {
        ...prev,
        [roleId]: Array.from(currentPermissions),
      };
    });
  };

  const handleSave = () => {
    // In a real app, you would save the permissions to your backend.
    console.log('Saving permissions:', permissions);
    alert('บันทึกการตั้งค่าสิทธิ์เรียบร้อยแล้ว (ดูใน Console)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>การจัดการสิทธิ์ผู้ใช้</CardTitle>
        <CardDescription>
          กำหนดว่าแต่ละบทบาทสามารถเข้าถึงโมดูลใดได้บ้างในระบบ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <Table className="min-w-max">
            <TableHeader>
                <TableRow className="bg-muted">
                <TableHead className="sticky left-0 z-10 bg-muted/95 backdrop-blur-sm">โมดูล</TableHead>
                {roles.map(role => (
                    <TableHead key={role.id} className="text-center">{role.label}</TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {modules.map(module => (
                <TableRow key={module.id}>
                    <TableCell className="font-medium sticky left-0 z-10 bg-card/95 backdrop-blur-sm">{module.label}</TableCell>
                    {roles.map(role => (
                    <TableCell key={`${module.id}-${role.id}`} className="text-center">
                        <Checkbox
                        checked={permissions[role.id]?.includes(module.id)}
                        onCheckedChange={(checked) => handlePermissionChange(role.id, module.id, !!checked)}
                        aria-label={`Permission for ${role.label} on ${module.label}`}
                        />
                    </TableCell>
                    ))}
                </TableRow>
                ))}
            </TableBody>
            </Table>
             <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการตั้งค่าสิทธิ์
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
