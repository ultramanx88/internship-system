'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { RoleManagementMatrix } from '@/components/admin/settings/RoleManagementMatrix';
import { AcademicCalendarSettings } from '@/components/admin/settings/AcademicCalendarSettings';
import { TitleManagement } from '@/components/admin/settings/TitleManagement';
import StaffHierarchicalAcademicManagement from '@/components/staff/settings/HierarchicalAcademicManagement';
import { DocumentNumberSettings } from '@/components/admin/settings/DocumentNumberSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AdminGuard } from '@/components/auth/PermissionGuard';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui';

export default function AdminSettingsPage() {
  const { logo, loginBackground, handleLogoChange, handleLoginBgChange, saveTheme } = useAppTheme();
  const { toast } = useToast();

  const runAcademicCreate = async () => {
    try {
      const created = await fetch('/api/admin/academic/test', { method: 'POST' });
      if (!created.ok) throw new Error('create failed');
      const createdJson = await created.json();
      const f = createdJson?.data?.faculty;
      const d = createdJson?.data?.department;
      const c = createdJson?.data?.curriculum;
      const m = createdJson?.data?.major;
      toast({ title: 'สร้างข้อมูลตัวอย่างสำเร็จ', description: `คณะ="${f?.nameTh}" → สาขา="${d?.nameTh}" → หลักสูตร="${c?.nameTh}" → วิชาเอก="${m?.nameTh}" (เก็บไว้ในฐานข้อมูล)` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'สร้างล้มเหลว', description: 'โปรดตรวจสอบสิทธิ์และฐานข้อมูล' });
    }
  };

  const runAcademicVerifyOnly = async () => {
    try {
      const verify = await fetch('/api/admin/academic/test');
      const verifyJson = await verify.json();
      const counts = verifyJson?.counts || {};
      toast({ title: 'ตรวจสอบข้อมูลทดสอบ', description: `fac:${counts.faculties ?? 0}, dept:${counts.departments ?? 0}, cur:${counts.curriculums ?? 0}, major:${counts.majors ?? 0}` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'ตรวจสอบล้มเหลว', description: 'โปรดตรวจสอบสิทธิ์และฐานข้อมูล' });
    }
  };

  const runAcademicCleanup = async () => {
    try {
      const cleaned = await fetch('/api/admin/academic/test', { method: 'DELETE' });
      if (!cleaned.ok) throw new Error('cleanup failed');
      toast({ title: 'ลบข้อมูลตัวอย่างแล้ว', description: 'ทำความสะอาดข้อมูลทดสอบทั้งหมดสำเร็จ' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'ลบข้อมูลทดสอบล้มเหลว', description: 'โปรดตรวจสอบสิทธิ์และฐานข้อมูล' });
    }
  };

  const runAcademicTest = async () => {
    try {
      const created = await fetch('/api/admin/academic/test', { method: 'POST' });
      if (!created.ok) throw new Error('create failed');
      const createdJson = await created.json();

      const verify = await fetch('/api/admin/academic/test');
      const verifyJson = await verify.json();

      const cleaned = await fetch('/api/admin/academic/test', { method: 'DELETE' });
      if (!cleaned.ok) throw new Error('cleanup failed');
      const f = createdJson?.data?.faculty;
      const d = createdJson?.data?.department;
      const c = createdJson?.data?.curriculum;
      const m = createdJson?.data?.major;
      const counts = verifyJson?.counts || {};
      toast({ 
        title: 'ทดสอบสำเร็จ', 
        description: `สร้าง: คณะ="${f?.nameTh}" → สาขา="${d?.nameTh}" → หลักสูตร="${c?.nameTh}" → วิชาเอก="${m?.nameTh}" | ตรวจสอบ: fac:${counts.faculties ?? 0}, dept:${counts.departments ?? 0}, cur:${counts.curriculums ?? 0}, major:${counts.majors ?? 0} | ทำความสะอาดแล้ว`
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'ทดสอบล้มเหลว', description: 'โปรดตรวจสอบสิทธิ์และฐานข้อมูล' });
    }
  };

  return (
    <AdminGuard>
      <div className="grid gap-8 text-secondary-600">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ตั้งค่าระบบ</h1>
          <p>จัดการการตั้งค่าและค่ากำหนดต่างๆ ของแอปพลิเคชัน</p>
        </div>

        <Accordion type="single" collapsible defaultValue="general" className="w-full">
          <AccordionItem value="titles">
            <AccordionTrigger>
              จัดการคำนำหน้า (Titles)
            </AccordionTrigger>
            <AccordionContent>
              <TitleManagement />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hierarchical">
            <AccordionTrigger>
              โครงสร้างลำดับชั้นบุคลากร/วิชาการ
            </AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="hierarchical" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="hierarchical">แบบลำดับชั้น</TabsTrigger>
                </TabsList>
                <TabsContent value="hierarchical">
                  {(process.env.NEXT_PUBLIC_ENABLE_ADMIN_TESTS === 'true' || process.env.NODE_ENV === 'development') && (
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={runAcademicCreate}>สร้างตัวอย่าง (เก็บไว้)</Button>
                        <Button variant="outline" onClick={runAcademicVerifyOnly}>ตรวจสอบ</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">ลบข้อมูลทดสอบ</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบข้อมูลทดสอบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                การลบนี้จะลบข้อมูลทดสอบทั้งหมดที่สร้างด้วยปุ่มชุดนี้ คุณแน่ใจหรือไม่?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={runAcademicCleanup}>ลบข้อมูล</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button>ทดสอบครบชุด (สร้าง→ตรวจ→ลบ)</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการทดสอบครบชุด</AlertDialogTitle>
                            <AlertDialogDescription>
                              ระบบจะสร้างข้อมูลทดสอบ ตรวจสอบ และลบออกทันที เหมาะสำหรับสภาพแวดล้อมพัฒนาเท่านั้น
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={runAcademicTest}>ดำเนินการ</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  <StaffHierarchicalAcademicManagement />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="doc-number">
            <AccordionTrigger>
              การกำหนดเลขที่เอกสาร (Document Numbers)
            </AccordionTrigger>
            <AccordionContent>
              <DocumentNumberSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calendar">
            <AccordionTrigger>
              ปฏิทินวิชาการ (Academic Calendar)
            </AccordionTrigger>
            <AccordionContent>
              <AcademicCalendarSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="roles">
            <AccordionTrigger>
              สิทธิ์และบทบาท (Role Management)
            </AccordionTrigger>
            <AccordionContent>
              <RoleManagementMatrix />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="general">
            <AccordionTrigger>
              การตั้งค่าทั่วไป (General)
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าทั่วไป</CardTitle>
                  <CardDescription>
                    จัดการการตั้งค่าพื้นฐานสำหรับระบบ เช่น ชื่อและโลโก้
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">ชื่อแอปพลิเคชัน</Label>
                    <Input id="app-name" defaultValue="InternshipFlow" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">โลโก้แอปพลิเคชัน</Label>
                    <div className="flex items-center gap-4">
                      {logo && <Image src={logo} alt="Current Logo" width={40} height={40} className="rounded-md" />}
                      <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="max-w-sm"/>
                    </div>
                     <p className="text-sm text-muted-foreground">
                        อัปโหลดไฟล์ภาพสำหรับโลโก้ (แนะนำ .png, .svg)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-bg-upload">ภาพพื้นหลังหน้า Login</Label>
                    <div className="flex items-center gap-4">
                      {loginBackground && <Image src={loginBackground} alt="Login Background" width={80} height={45} className="rounded-md object-cover" />}
                      <Input id="login-bg-upload" type="file" accept="image/*" onChange={handleLoginBgChange} className="max-w-sm"/>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      เลือกภาพพื้นหลังสำหรับหน้าเข้าสู่ระบบ (แนวแนะนำ 1920x1080)
                    </p>
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
                   <Button onClick={saveTheme}>
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการเปลี่ยนแปลง
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AdminGuard>
  );
}
