'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-8 text-secondary-600">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ตั้งค่าระบบ</h1>
        <p>จัดการการตั้งค่าและค่ากำหนดต่างๆ ของแอปพลิเคชัน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่าทั่วไป</CardTitle>
          <CardDescription>
            จัดการการตั้งค่าพื้นฐานสำหรับระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="app-name">ชื่อแอปพลิเคชัน</Label>
            <Input id="app-name" defaultValue="InternshipFlow" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">โหมดบำรุงรักษา</Label>
                <p className="text-sm text-muted-foreground">
                    เปิดใช้งานโหมดบำรุงรักษาเพื่อปิดการเข้าถึงของผู้ใช้ชั่วคราว
                </p>
            </div>
            <Switch id="maintenance-mode" />
          </div>
           <Button>
              <Save className="mr-2 h-4 w-4" />
              บันทึกการเปลี่ยนแปลง
          </Button>
        </CardContent>
      </Card>
      
    </div>
  );
}
