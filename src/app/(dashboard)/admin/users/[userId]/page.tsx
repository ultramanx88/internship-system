'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { users as mockUsers } from '@/lib/data';
import { roles as mockRoles } from '@/lib/permissions';
import { titles as mockTitles } from '@/lib/data';
import { User, Role } from '@prisma/client';

import {
  X as CancelIcon,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import { PROTECTED_PATH } from "../../../../../constant/path.route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
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
    // In a real app, you would fetch the user from the API
    // For demo purposes, we find the user in the mock data
    const foundUser: any = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser as User);
      setFormData({
          Login_id: foundUser.id,
          password: '', // Password should not be pre-filled for security
          role_id: foundUser.roles.length > 0 ? (foundUser.roles[0] as string) : '',
          t_name: foundUser.t_name || '',
          t_surname: foundUser.t_surname || '',
          e_name: foundUser.e_name || '',
          e_surname: foundUser.e_surname || '',
          email: foundUser.email,
          t_title: foundUser.t_title || '',
          t_middlename: foundUser.t_middlename || '',
          e_title: foundUser.e_title || '',
          e_middle_name: foundUser.e_middle_name || '',
      });
    }
    setIsLoading(false);
  }, [userId]);

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
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user');
        }
        
        toast({
            title: "บันทึกสำเร็จ",
            description: "ข้อมูลผู้ใช้ได้รับการอัปเดตเรียบร้อยแล้ว",
        });
        setIsEdit(false);
        // Here you might want to refetch the user data or update the local state
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
    return <p>Loading...</p>
  }

  if (!user) {
    return <p>User not found</p>
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
                        <Label htmlFor="Login_id">Login ID (รหัสนักศึกษา/ผู้ใช้)</Label>
                        <Input id="Login_id" value={formData.Login_id} onChange={handleInputChange} disabled />
                    </div>
                     <div>
                        <Label htmlFor="email">อีเมล</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEdit} />
                    </div>
                    <div>
                        <Label htmlFor="password">รหัสผ่านใหม่</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} disabled={!isEdit} placeholder="เปลี่ยนรหัสผ่าน (ถ้าต้องการ)"/>
                    </div>
                     <div>
                        <Label htmlFor="role_id">ตำแหน่ง (Role)</Label>
                        <Select value={formData.role_id} onValueChange={handleSelectChange('role_id')} disabled={!isEdit}>
                            <SelectTrigger id="role_id">
                                <SelectValue placeholder="เลือกตำแหน่ง" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockRoles.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Thai Name */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-600">ข้อมูลชื่อ (ภาษาไทย)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <Label htmlFor="t_title">คำนำหน้า</Label>
                        <Select value={formData.t_title} onValueChange={handleSelectChange('t_title')} disabled={!isEdit}>
                            <SelectTrigger id="t_title">
                                <SelectValue placeholder="เลือกคำนำหน้า" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockTitles.map(t => <SelectItem key={t.id} value={t.nameTh}>{t.nameTh}</SelectItem>)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <Label htmlFor="e_title">Title</Label>
                        <Select value={formData.e_title} onValueChange={handleSelectChange('e_title')} disabled={!isEdit}>
                            <SelectTrigger id="e_title">
                                <SelectValue placeholder="Select Title" />
                            </SelectTrigger>
                            <SelectContent>
                                 {mockTitles.map(t => <SelectItem key={t.id} value={t.nameEn}>{t.nameEn}</SelectItem>)}
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
