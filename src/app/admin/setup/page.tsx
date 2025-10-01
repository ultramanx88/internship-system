'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Database, Users, Building, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [migrateResult, setMigrateResult] = useState<any>(null);
  const [secretKey, setSecretKey] = useState('');
  const { toast } = useToast();

  const handleMigrate = async () => {
    if (!secretKey) {
      toast({
        variant: 'destructive',
        title: 'ข้อผิดพลาด',
        description: 'กรุณาใส่ Secret Key',
      });
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch(`/api/migrate?secret=${secretKey}`, {
        method: 'POST',
      });
      const data = await response.json();
      setMigrateResult(data);
      
      if (response.ok) {
        toast({
          title: 'ตรวจสอบฐานข้อมูลสำเร็จ',
          description: 'การเชื่อมต่อฐานข้อมูลทำงานปกติ',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถตรวจสอบฐานข้อมูลได้',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSeed = async () => {
    if (!secretKey) {
      toast({
        variant: 'destructive',
        title: 'ข้อผิดพลาด',
        description: 'กรุณาใส่ Secret Key',
      });
      return;
    }

    setIsSeeding(true);
    try {
      const response = await fetch(`/api/seed?secret=${secretKey}`, {
        method: 'POST',
      });
      const data = await response.json();
      setSeedResult(data);
      
      if (response.ok) {
        toast({
          title: 'Seed ข้อมูลสำเร็จ',
          description: 'ข้อมูลทดสอบถูกเพิ่มเข้าระบบเรียบร้อยแล้ว',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถ seed ข้อมูลได้',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถ seed ข้อมูลได้',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">ตั้งค่าฐานข้อมูลและข้อมูลเริ่มต้น</p>
      </div>

      <div className="grid gap-6">
        {/* Secret Key Input */}
        <Card>
          <CardHeader>
            <CardTitle>Secret Key</CardTitle>
            <CardDescription>
              ใส่ Secret Key สำหรับการตั้งค่าระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret Key</Label>
              <Input
                id="secret"
                type="password"
                placeholder="ใส่ Secret Key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Migration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ตรวจสอบฐานข้อมูล
            </CardTitle>
            <CardDescription>
              ตรวจสอบการเชื่อมต่อฐานข้อมูลและสถานะ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleMigrate} 
              disabled={isMigrating || !secretKey}
              className="w-full"
            >
              {isMigrating ? 'กำลังตรวจสอบ...' : 'ตรวจสอบฐานข้อมูล'}
            </Button>
            
            {migrateResult && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {migrateResult.status === 'connected' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {migrateResult.status === 'connected' ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อล้มเหลว'}
                  </span>
                </div>
                {migrateResult.counts && (
                  <div className="text-sm space-y-1">
                    <p>ผู้ใช้: {migrateResult.counts.users} คน</p>
                    <p>บริษัท: {migrateResult.counts.companies} แห่ง</p>
                    <p>ตำแหน่งฝึกงาน: {migrateResult.counts.internships} ตำแหน่ง</p>
                    <p>ใบสมัคร: {migrateResult.counts.applications} ใบ</p>
                  </div>
                )}
                {migrateResult.error && (
                  <p className="text-sm text-red-600">{migrateResult.details}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Seeding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              เพิ่มข้อมูลทดสอบ
            </CardTitle>
            <CardDescription>
              เพิ่มข้อมูลผู้ใช้และข้อมูลทดสอบเข้าระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSeed} 
              disabled={isSeeding || !secretKey}
              className="w-full"
            >
              {isSeeding ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มข้อมูลทดสอบ'}
            </Button>
            
            {seedResult && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {seedResult.message?.includes('success') ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{seedResult.message}</span>
                </div>
                {seedResult.data && (
                  <div className="text-sm space-y-1">
                    <p>ผู้ใช้: {seedResult.data.users} คน</p>
                    <p>บริษัท: {seedResult.data.companies} แห่ง</p>
                    <p>ตำแหน่งฝึกงาน: {seedResult.data.internships} ตำแหน่ง</p>
                    <p>ใบสมัคร: {seedResult.data.applications} ใบ</p>
                  </div>
                )}
                {seedResult.error && (
                  <p className="text-sm text-red-600">{seedResult.details}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>คำแนะนำ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. ตรวจสอบฐานข้อมูลก่อนเพื่อดูสถานะปัจจุบัน</p>
            <p>2. หากยังไม่มีข้อมูล ให้เพิ่มข้อมูลทดสอบ</p>
            <p>3. ข้อมูลทดสอบจะรวมผู้ใช้ทุก role: admin, staff, instructor, student</p>
            <p>4. รหัสผ่านเริ่มต้นสำหรับทุกบัญชี: <code>123456</code></p>
            <p>5. Secret Key สำหรับ migrate: <code>migrate-db-2024</code></p>
            <p>6. Secret Key สำหรับ seed: <code>seed-data-2024</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}