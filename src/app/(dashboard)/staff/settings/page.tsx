'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useProfileImage } from '@/hooks/use-profile-image';
import { FileStorageService } from '@/lib/file-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, User, Bell, Shield, Database, Mail, Globe, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { AcademicManagement } from '@/components/staff/settings/AcademicManagement';
import { EducatorManagement } from '@/components/staff/settings/EducatorManagement';
import StaffHierarchicalAcademicManagement from '@/components/staff/settings/HierarchicalAcademicManagement';

export default function SettingsPage() {
    const { user } = useAuth();
    const { profileImage, updateProfileImage } = useProfileImage();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        newApplications: true,
        statusUpdates: true,
        reminders: false
    });

    const [profile, setProfile] = useState({
        name: 'นางสาวสุดา ธุรการ',
        email: 'suda.admin@university.ac.th',
        phone: '02-123-4567',
        department: 'สำนักงานสหกิจศึกษา',
        position: 'เจ้าหน้าที่ธุรการ'
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">ตั้งค่า</h1>
                        <p className="text-gray-600 mt-2">จัดการการตั้งค่าระบบและข้อมูลส่วนตัว</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
                            {profileImage ? (
                                <Image src={profileImage} alt="profile" fill sizes="64px" className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No Photo</div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="staff-avatar" className="inline-flex items-center px-3 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 cursor-pointer">
                                {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปโปรไฟล์'}
                            </label>
                            <input
                                id="staff-avatar"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file && user?.id) {
                                        setIsUploading(true);
                                        try {
                                            const result = await FileStorageService.uploadFile(file, user.id);
                                            if (result.success && result.url) {
                                                updateProfileImage(result.url);
                                                try {
                                                    await fetch('/api/user/profile', {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
                                                        body: JSON.stringify({ profileImage: result.url }),
                                                    });
                                                } catch {}
                                            }
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            ข้อมูลส่วนตัว
                        </TabsTrigger>
                        <TabsTrigger value="academic" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            ปีการศึกษา
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            วิชา
                        </TabsTrigger>
                        <TabsTrigger value="educators" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            บุคลากร
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            การแจ้งเตือน
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            ความปลอดภัย
                        </TabsTrigger>
                        <TabsTrigger value="system" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            ระบบ
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Settings */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    ข้อมูลส่วนตัว
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                                        <Input
                                            id="name"
                                            value={profile.name}
                                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">อีเมล</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                        <Input
                                            id="phone"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">หน่วยงาน</Label>
                                        <Input
                                            id="department"
                                            value={profile.department}
                                            onChange={(e) => setProfile({...profile, department: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="position">ตำแหน่ง</Label>
                                        <Input
                                            id="position"
                                            value={profile.position}
                                            onChange={(e) => setProfile({...profile, position: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        className="bg-amber-600 hover:bg-amber-700"
                                        disabled={isSaving}
                                        onClick={async () => {
                                            if (!user?.id) return;
                                            setIsSaving(true);
                                            try {
                                                const res = await fetch('/api/user/settings', {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'x-user-id': user.id,
                                                    },
                                                    body: JSON.stringify({
                                                        email: profile.email,
                                                        phone: profile.phone,
                                                        notifications: {
                                                            email: notifications.email,
                                                            push: notifications.push,
                                                            sms: notifications.sms,
                                                            applicationUpdates: notifications.statusUpdates,
                                                            deadlineReminders: notifications.reminders,
                                                        },
                                                    }),
                                                });
                                                const data = await res.json();
                                                if (!res.ok) throw new Error(data?.error || 'บันทึกไม่สำเร็จ');
                                                toast({ title: 'บันทึกสำเร็จ', description: 'อัปเดตการตั้งค่าเรียบร้อยแล้ว' });
                                            } catch (e: any) {
                                                toast({ variant: 'destructive', title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถบันทึกการตั้งค่าได้' });
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Academic Management */}
                    <TabsContent value="academic" className="space-y-6">
                        <AcademicManagement />
                    </TabsContent>

                    {/* Course Management + Hierarchical Tree */}
                    <TabsContent value="courses" className="space-y-6">
                        <StaffHierarchicalAcademicManagement />
                    </TabsContent>

                    {/* Educator Management */}
                    <TabsContent value="educators" className="space-y-6">
                        <EducatorManagement />
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    การแจ้งเตือน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">ช่องทางการแจ้งเตือน</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">อีเมล</p>
                                                    <p className="text-sm text-gray-500">รับการแจ้งเตือนทางอีเมล</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={notifications.email}
                                                onCheckedChange={(checked) => 
                                                    setNotifications({...notifications, email: checked})
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Bell className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">การแจ้งเตือนแบบ Push</p>
                                                    <p className="text-sm text-gray-500">รับการแจ้งเตือนในเบราว์เซอร์</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={notifications.push}
                                                onCheckedChange={(checked) => 
                                                    setNotifications({...notifications, push: checked})
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">ประเภทการแจ้งเตือน</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">ใบสมัครใหม่</p>
                                                <p className="text-sm text-gray-500">เมื่อมีนักศึกษายื่นใบสมัครใหม่</p>
                                            </div>
                                            <Switch
                                                checked={notifications.newApplications}
                                                onCheckedChange={(checked) => 
                                                    setNotifications({...notifications, newApplications: checked})
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">อัปเดตสถานะ</p>
                                                <p className="text-sm text-gray-500">เมื่อมีการเปลี่ยนแปลงสถานะเอกสาร</p>
                                            </div>
                                            <Switch
                                                checked={notifications.statusUpdates}
                                                onCheckedChange={(checked) => 
                                                    setNotifications({...notifications, statusUpdates: checked})
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">การแจ้งเตือนกำหนดเวลา</p>
                                                <p className="text-sm text-gray-500">แจ้งเตือนงานที่ใกล้ครบกำหนด</p>
                                            </div>
                                            <Switch
                                                checked={notifications.reminders}
                                                onCheckedChange={(checked) => 
                                                    setNotifications({...notifications, reminders: checked})
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        บันทึกการตั้งค่า
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    ความปลอดภัย
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">เปลี่ยนรหัสผ่าน</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                                            <Input id="currentPassword" type="password" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                                            <Input id="newPassword" type="password" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                                            <Input id="confirmPassword" type="password" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">การตั้งค่าความปลอดภัย</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">การยืนยันตัวตนสองขั้นตอน</p>
                                                <p className="text-sm text-gray-500">เพิ่มความปลอดภัยด้วย OTP</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">แจ้งเตือนการเข้าสู่ระบบ</p>
                                                <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีการเข้าสู่ระบบใหม่</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        อัปเดตความปลอดภัย
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Settings */}
                    <TabsContent value="system" className="space-y-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    การตั้งค่าระบบ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">การตั้งค่าทั่วไป</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="language">ภาษา</Label>
                                            <Select defaultValue="th">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="th">ไทย</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">เขตเวลา</Label>
                                            <Select defaultValue="asia-bangkok">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="asia-bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                                                    <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">การตั้งค่าการแสดงผล</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">โหมดมืด</p>
                                                <p className="text-sm text-gray-500">เปลี่ยนธีมเป็นโหมดมืด</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="itemsPerPage">จำนวนรายการต่อหน้า</Label>
                                            <Select defaultValue="20">
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="20">20</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">การสำรองข้อมูล</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">สำรองข้อมูลอัตโนมัติ</p>
                                                <p className="text-sm text-gray-500">สำรองข้อมูลทุกวันเวลา 02:00 น.</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline">
                                                สำรองข้อมูลตอนนี้
                                            </Button>
                                            <Button variant="outline">
                                                ดาวน์โหลดข้อมูลสำรอง
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button className="bg-amber-600 hover:bg-amber-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        บันทึกการตั้งค่า
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}