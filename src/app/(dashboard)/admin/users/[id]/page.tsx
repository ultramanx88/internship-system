'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roles as mockRoles } from '@/lib/permissions';
import { titles as mockTitles } from '@/lib/data';
import { User, Role } from '@prisma/client';

import {
  X as CancelIcon,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import { PROTECTED_PATH } from "@/constant/path.route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SafeSelect, SafeSelectItem } from '@/components/ui/safe-select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    Login_id: '',
    password: '',
    role_id: '',
    t_title: '',
    t_name: '',
    t_middlename: '',
    t_surname: '',
    e_title: '',
    e_name: '',
    e_middle_name: '',
    e_surname: '',
    email: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching user:', userId);
        const response = await fetch(`/api/users/${userId}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const foundUser = await response.json();
          console.log('Found user:', foundUser);
          setUser(foundUser as User);
          const userRoles = Array.isArray(foundUser.roles) ? foundUser.roles : JSON.parse(foundUser.roles || '[]');
          const newFormData = {
            Login_id: foundUser.id || '',
            password: '', // Password should not be pre-filled for security
            role_id: userRoles.length > 0 ? userRoles[0] : '',
            t_name: foundUser.t_name || '',
            t_surname: foundUser.t_surname || '',
            e_name: foundUser.e_name || '',
            e_surname: foundUser.e_surname || '',
            email: foundUser.email || '',
            t_title: foundUser.t_title || '',
            t_middlename: foundUser.t_middle_name || '',
            e_title: foundUser.e_title || '',
            e_middle_name: foundUser.e_middle_name || '',
          };
          
          console.log('Setting form data:', newFormData);
          console.log('User data from API:', foundUser);
          console.log('t_title value:', newFormData.t_title);
          console.log('e_title value:', newFormData.e_title);
          setFormData(newFormData);
        } else {
          toast({
            variant: 'destructive',
            title: 'ไม่พบผู้ใช้งาน',
            description: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
          });
          router.push('/admin/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, toast, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };
  
  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!formData.Login_id.trim()) {
            throw new Error('Login ID จำเป็นต้องระบุ');
        }
        
        // ตรวจสอบว่ามีชื่อ-นามสกุลอย่างน้อยหนึ่งภาษา
        const hasThaiName = formData.t_name.trim() && formData.t_surname.trim();
        const hasEnglishName = formData.e_name.trim() && formData.e_surname.trim();
        
        if (!hasThaiName && !hasEnglishName) {
            throw new Error('ต้องกรอกชื่อ-นามสกุลภาษาไทย หรือ ชื่อ-นามสกุลภาษาอังกฤษ อย่างน้อยหนึ่งชุด');
        }
        
        // ถ้ากรอกชื่อไทย ต้องมีคำนำหน้าไทย
        if (formData.t_name.trim() && !formData.t_title.trim()) {
            throw new Error('ถ้ากรอกชื่อไทย ต้องเลือกคำนำหน้าไทยด้วย');
        }
        
        // ถ้ากรอกชื่ออังกฤษ ต้องมีคำนำหน้าอังกฤษ
        if (formData.e_name.trim() && !formData.e_title.trim()) {
            throw new Error('ถ้ากรอกชื่ออังกฤษ ต้องเลือกคำนำหน้าอังกฤษด้วย');
        }

        // แปลงข้อมูลให้ตรงกับ API
        const apiData = {
            newId: formData.Login_id,
            email: formData.email || undefined, // ไม่บังคับอีเมล์
            password: formData.password || undefined,
            roles: formData.role_id ? [formData.role_id] : [],
            t_title: formData.t_title,
            t_name: formData.t_name,
            t_middle_name: formData.t_middlename,
            t_surname: formData.t_surname,
            e_title: formData.e_title,
            e_name: formData.e_name,
            e_middle_name: formData.e_middle_name,
            e_surname: formData.e_surname,
        };

        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user');
        }
        
        const result = await response.json();
        
        toast({
            title: "บันทึกสำเร็จ",
            description: formData.Login_id !== userId 
              ? `เปลี่ยน Login ID จาก ${userId} เป็น ${formData.Login_id} และอัปเดตข้อมูลเรียบร้อยแล้ว`
              : "ข้อมูลผู้ใช้ได้รับการอัปเดตเรียบร้อยแล้ว",
        });
        setIsEdit(false);
        
        // ถ้าเปลี่ยน Login ID ให้ redirect ไปหน้าใหม่
        if (formData.Login_id !== userId) {
          router.push(`/admin/users/${formData.Login_id}`);
        } else {
          // Refresh ข้อมูลผู้ใช้
          const refreshResponse = await fetch(`/api/users/${userId}`);
          if (refreshResponse.ok) {
            const updatedUser = await refreshResponse.json();
            setUser(updatedUser);
          }
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'เกิดข้อผิดพลาด',
            description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-lg">กำลังโหลดข้อมูลผู้ใช้...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">ไม่พบผู้ใช้</h2>
          <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลผู้ใช้ได้</p>
        </div>
      </div>
    );
  }
  
  return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">ข้อมูลผู้ใช้งาน</CardTitle>
              <CardDescription>จัดการรายละเอียดและข้อมูลส่วนตัวของผู้ใช้</CardDescription>
            </div>
            <div className="flex gap-2">
              {isEdit ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'กำลังบันทึก' : 'ยืนยันและบันทึก'}
                  </Button>
                   <Button variant="outline" onClick={() => setIsEdit(false)} disabled={isSaving}>
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEdit(true)}>
                  <Edit className="mr-2" />
                  แก้ไขข้อมูล
                </Button>
              )}
               <Button variant="ghost" size="icon" onClick={() => router.push(PROTECTED_PATH.UPLOAD_LIST)}>
                  <CancelIcon className="text-gray-500" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Login Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-600">ข้อมูลการเข้าสู่ระบบ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="Login_id">Login ID (รหัสนักศึกษา/ผู้ใช้) *</Label>
                        <Input id="Login_id" value={formData.Login_id} onChange={handleInputChange} disabled={!isEdit} />
                        {isEdit && (
                          <p className="text-sm text-muted-foreground mt-1">
                            สามารถแก้ไข Login ID ได้ แต่ต้องไม่ซ้ำกับผู้ใช้อื่น
                          </p>
                        )}
                    </div>
                     <div>
                        <Label htmlFor="email">อีเมล (ไม่บังคับ)</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                    <div>
                        <Label htmlFor="password">รหัสผ่านใหม่</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} disabled={!isEdit} placeholder="เปลี่ยนรหัสผ่าน (ถ้าต้องการ)"/>
                    </div>
                     <div>
                        <Label htmlFor="role_id">ตำแหน่ง (Role)</Label>
                        <Select value={formData.role_id || ''} onValueChange={handleSelectChange('role_id')} disabled={!isEdit}>
                            <SelectTrigger id="role_id">
                                <SelectValue placeholder="เลือกตำแหน่ง" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockRoles?.filter(r => r?.id && r?.label).map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Thai Name */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-600">ข้อมูลชื่อ (ภาษาไทย)</h3>
                {isEdit && (
                  <p className="text-sm text-muted-foreground">
                    สำหรับนักศึกษาไทย: กรอกคำนำหน้า ชื่อ และนามสกุลไทย (กรอกภาษาอังกฤษเพิ่มได้)
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <Label htmlFor="t_title">คำนำหน้า</Label>
                        <Select value={formData.t_title || ''} onValueChange={handleSelectChange('t_title')} disabled={!isEdit}>
                            <SelectTrigger id="t_title">
                                <SelectValue placeholder="เลือกคำนำหน้า" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">ไม่ระบุ</SelectItem>
                                {mockTitles?.filter(t => t?.nameTh).map(t => (
                                    <SelectItem key={t.id} value={t.nameTh}>{t.nameTh}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="t_name">ชื่อ</Label>
                        <Input id="t_name" value={formData.t_name} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                     <div>
                        <Label htmlFor="t_middlename">ชื่อกลาง</Label>
                        <Input id="t_middlename" value={formData.t_middlename} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                     <div>
                        <Label htmlFor="t_surname">นามสกุล</Label>
                        <Input id="t_surname" value={formData.t_surname} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                </div>
            </div>
            
            <Separator />

            {/* English Name */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-600">ข้อมูลชื่อ (ภาษาอังกฤษ)</h3>
                {isEdit && (
                  <p className="text-sm text-muted-foreground">
                    สำหรับนักศึกษาต่างชาติ: กรอกคำนำหน้า ชื่อ และนามสกุลอังกฤษ
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <Label htmlFor="e_title">Title</Label>
                        <Select value={formData.e_title || ''} onValueChange={handleSelectChange('e_title')} disabled={!isEdit}>
                            <SelectTrigger id="e_title">
                                <SelectValue placeholder="Select Title" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Not specified</SelectItem>
                                {mockTitles?.filter(t => t?.nameEn).map(t => (
                                    <SelectItem key={t.id} value={t.nameEn}>{t.nameEn}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="e_name">First Name</Label>
                        <Input id="e_name" value={formData.e_name} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                     <div>
                        <Label htmlFor="e_middle_name">Middle Name</Label>
                        <Input id="e_middle_name" value={formData.e_middle_name} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                     <div>
                        <Label htmlFor="e_surname">Surname</Label>
                        <Input id="e_surname" value={formData.e_surname} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                </div>
            </div>

        </CardContent>
      </Card>
  );
}
