'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Users, CheckCircle } from 'lucide-react';
import { RoleManagementMatrix } from '@/components/admin/settings/RoleManagementMatrix';
import { AcademicCalendarSettings } from '@/components/admin/settings/AcademicCalendarSettings';
import { TitleManagement } from '@/components/admin/settings/TitleManagement';
import StaffHierarchicalAcademicManagement from '@/components/staff/settings/HierarchicalAcademicManagement';
import { DocumentNumberSettings } from '@/components/admin/settings/DocumentNumberSettings';
// import { DemoUsersToggle } from '@/components/admin/DemoUsersToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useState } from 'react';
import { AdminGuard } from '@/components/auth/PermissionGuard';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui';

export default function AdminSettingsPage() {
  const { logo, loginBackground, isUploading, handleLogoChange, handleLoginBgChange, saveTheme } = useAppTheme();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  const handleLogoPreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Logo file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('Logo preview loaded:', result.substring(0, 50) + '...');
        setLogoPreview(result);
      };
      reader.onerror = (e) => {
        console.error('Error reading logo file:', e);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleBgPreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Background file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('Background preview loaded:', result.substring(0, 50) + '...');
        setBgPreview(result);
      };
      reader.onerror = (e) => {
        console.error('Error reading background file:', e);
      };
      reader.readAsDataURL(file);
    } else {
      setBgPreview(null);
    }
  };

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

          <AccordionItem value="ui-settings">
            <AccordionTrigger>
              การตั้งค่าหน้าจอและ UI
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
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
                        <Switch
                          id="demo-toggle"
                          defaultChecked={false}
                          onCheckedChange={(checked) => {
                            // เก็บการตั้งค่าใน localStorage
                            localStorage.setItem('demo_users_toggle', checked.toString());
                            toast({
                              title: 'การตั้งค่าอัปเดตแล้ว',
                              description: `Dropdown ผู้ใช้สาธิต ${checked ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`,
                            });
                          }}
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
                  </CardContent>
                </Card>
              </div>
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
                      <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 relative">
                        {isUploading.logo ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="w-full h-full object-contain rounded-md"
                            onError={(e) => {
                              console.error('Logo preview error:', e);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : logo ? (
                          <Image 
                            src={logo} 
                            alt="Current Logo" 
                            width={40} 
                            height={40} 
                            className="rounded-md object-contain"
                            onError={(e) => {
                              console.error('Current logo error:', e);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">Logo</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          id="logo-upload" 
                          type="file" 
                          accept="image/*" 
                          disabled={isUploading.logo}
                          onChange={async (e) => {
                            handleLogoPreview(e);
                            const result = await handleLogoChange(e);
                            
                            if (result.success) {
                              toast({
                                title: 'สำเร็จ',
                                description: result.message,
                              });
                              // Clear preview after successful upload
                              setLogoPreview(null);
                            } else {
                              toast({
                                title: 'เกิดข้อผิดพลาด',
                                description: result.message,
                                variant: 'destructive',
                              });
                            }
                          }} 
                          className="max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {logoPreview ? 'Preview: Ready' : logo ? 'Current: Loaded' : 'No logo'}
                        </p>
                        {logoPreview && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>ไฟล์พร้อมอัปโหลด</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      อัปโหลดไฟล์ภาพสำหรับโลโก้ (แนะนำ .png, .svg)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-bg-upload">ภาพพื้นหลังหน้า Login</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 relative">
                        {isUploading.background ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : bgPreview ? (
                          <img 
                            src={bgPreview} 
                            alt="Background Preview" 
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              console.error('Background preview error:', e);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : loginBackground ? (
                          <Image 
                            src={loginBackground} 
                            alt="Login Background" 
                            width={80} 
                            height={45} 
                            className="rounded-md object-cover"
                            onError={(e) => {
                              console.error('Current background error:', e);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">BG</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          id="login-bg-upload" 
                          type="file" 
                          accept="image/*" 
                          disabled={isUploading.background}
                          onChange={async (e) => {
                            handleBgPreview(e);
                            const result = await handleLoginBgChange(e);
                            
                            if (result.success) {
                              toast({
                                title: 'สำเร็จ',
                                description: result.message,
                              });
                              // Clear preview after successful upload
                              setBgPreview(null);
                            } else {
                              toast({
                                title: 'เกิดข้อผิดพลาด',
                                description: result.message,
                                variant: 'destructive',
                              });
                            }
                          }} 
                          className="max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {bgPreview ? 'Preview: Ready' : loginBackground ? 'Current: Loaded' : 'No background'}
                        </p>
                        {bgPreview && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>ไฟล์พร้อมอัปโหลด</span>
                            </div>
                          </div>
                        )}
                      </div>
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
