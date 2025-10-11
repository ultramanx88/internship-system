'use client';

import { useState } from 'react';
import { useSystemSettings } from '@/hooks/use-system-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DemoUsersToggle() {
  const { getBooleanSetting, updateSetting, loading } = useSystemSettings();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const isEnabled = getBooleanSetting('demo_users_toggle', false);

  const handleToggle = async (enabled: boolean) => {
    try {
      setIsUpdating(true);
      await updateSetting(
        'demo_users_toggle',
        enabled ? 'true' : 'false',
        'Toggle for demo users dropdown visibility in login form',
        'ui'
      );
      
      toast({
        title: 'การตั้งค่าอัปเดตแล้ว',
        description: `Dropdown ผู้ใช้สาธิต ${enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`,
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตการตั้งค่าได้',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            การตั้งค่า Dropdown ผู้ใช้สาธิต
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          การตั้งค่า Dropdown ผู้ใช้สาธิต
        </CardTitle>
        <CardDescription>
          ควบคุมการแสดงผล dropdown ผู้ใช้สาธิตในหน้าเข้าสู่ระบบ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="demo-toggle" className="text-base font-medium">
              แสดง Dropdown ผู้ใช้สาธิต
            </Label>
            <p className="text-sm text-muted-foreground">
              เมื่อเปิดใช้งาน ผู้ใช้จะเห็น dropdown สำหรับเลือกผู้ใช้สาธิตในหน้าเข้าสู่ระบบ
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <Switch
              id="demo-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
            />
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="text-sm">
              <p className="font-medium">หมายเหตุ:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• การตั้งค่านี้จะมีผลทันทีหลังจากบันทึก</li>
                <li>• ในโหมด development จะแสดง dropdown เสมอ</li>
                <li>• ในโหมด production จะใช้การตั้งค่านี้</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            สถานะปัจจุบัน: <span className={isEnabled ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggle(!isEnabled)}
            disabled={isUpdating}
          >
            {isUpdating ? 'กำลังบันทึก...' : isEnabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
