'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Camera,
  Save,
  Key
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - ในอนาคตจะดึงจาก API
  const [userData, setUserData] = useState({
    // ข้อมูลภาษาไทย
    thaiTitle: 'นาย',
    thaiName: 'สมชาย',
    thaiMiddleName: '',
    thaiSurname: 'ใจดี',
    // ข้อมูลภาษาอังกฤษ
    englishTitle: 'Mr.',
    englishName: 'Somchai',
    englishMiddleName: '',
    englishSurname: 'Jaidee',
    // ข้อมูลอื่นๆ
    email: user?.email || 'student@university.ac.th',
    phone: '081-234-5678',
    studentId: '6401234567',
    faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    department: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
    program: 'เทคโนโลยีสารสนเทศ',
    major: 'เทคโนโลยีสารสนเทศ',
    campus: 'วิทยาเขตหลัก',
    gpa: '3.25'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    applicationUpdates: true,
    deadlineReminders: true,
    systemNews: false
  });

  const [preferences, setPreferences] = useState({
    language: 'th',
    theme: 'light',
    dateFormat: 'thai'
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Check if came from application-form timeline
    const fromTimeline = searchParams.get('from') === 'timeline';
    
    if (fromTimeline) {
      // Redirect back to application-form to continue timeline
      router.push('/student/application-form');
    }
    // Show success message if not redirecting
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          <TabsTrigger value="preferences">ค่าเริ่มต้น</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>

        {/* ข้อมูลส่วนตัว */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                แก้ไขข้อมูลส่วนตัวและข้อมูลการศึกษา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* รูปโปรไฟล์ */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">
                    {userData.thaiName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    เปลี่ยนรูปโปรไฟล์
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB
                  </p>
                </div>
              </div>

              <Separator />

              {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-medium text-amber-700">ข้อมูลส่วนตัว</h3>
                </div>

                {/* ชื่อภาษาไทย */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="thaiTitle">คำนำหน้า</Label>
                    <p className="text-xs text-muted-foreground mb-1">Title</p>
                    <Select value={userData.thaiTitle} onValueChange={(value) => setUserData({...userData, thaiTitle: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="คำนำหน้า (Title)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="นาย">นาย</SelectItem>
                        <SelectItem value="นาง">นาง</SelectItem>
                        <SelectItem value="นางสาว">นางสาว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="thaiName">ชื่อจริง</Label>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <Input
                      id="thaiName"
                      placeholder="ชื่อจริง (Name)"
                      value={userData.thaiName}
                      onChange={(e) => setUserData({...userData, thaiName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thaiMiddleName">ชื่อกลาง</Label>
                    <p className="text-xs text-muted-foreground mb-1">Middle name</p>
                    <Input
                      id="thaiMiddleName"
                      placeholder="ชื่อกลาง (Middle name)"
                      value={userData.thaiMiddleName}
                      onChange={(e) => setUserData({...userData, thaiMiddleName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thaiSurname">นามสกุล</Label>
                    <p className="text-xs text-muted-foreground mb-1">Surname</p>
                    <Input
                      id="thaiSurname"
                      placeholder="นามสกุล (Surname)"
                      value={userData.thaiSurname}
                      onChange={(e) => setUserData({...userData, thaiSurname: e.target.value})}
                    />
                  </div>
                </div>

                {/* รหัสนักศึกษา */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="studentId">รหัสนักศึกษา</Label>
                    <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                    <Input
                      id="studentId"
                      placeholder="รหัสนักศึกษา (Student ID)"
                      value={userData.studentId}
                      onChange={(e) => setUserData({...userData, studentId: e.target.value})}
                    />
                  </div>
                </div>

                {/* ข้อมูลการศึกษา */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="faculty">คณะ</Label>
                    <p className="text-xs text-muted-foreground mb-1">Faculty</p>
                    <Select value={userData.faculty} onValueChange={(value) => setUserData({...userData, faculty: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="คณะ (Faculty)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="คณะวิทยาศาสตร์และเทคโนโลยี">คณะวิทยาศาสตร์และเทคโนโลยี</SelectItem>
                        <SelectItem value="คณะบริหารธุรกิจ">คณะบริหารธุรกิจ</SelectItem>
                        <SelectItem value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">สาขา</Label>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <Select value={userData.department} onValueChange={(value) => setUserData({...userData, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="สาขา (Department)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</SelectItem>
                        <SelectItem value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</SelectItem>
                        <SelectItem value="การจัดการธุรกิจ">การจัดการธุรกิจ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="program">หลักสูตร</Label>
                    <p className="text-xs text-muted-foreground mb-1">Program</p>
                    <Select value={userData.program} onValueChange={(value) => setUserData({...userData, program: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="หลักสูตร (Program)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</SelectItem>
                        <SelectItem value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="major">วิชาเอก</Label>
                    <p className="text-xs text-muted-foreground mb-1">Major</p>
                    <Select value={userData.major} onValueChange={(value) => setUserData({...userData, major: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="วิชาเอก (Major)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</SelectItem>
                        <SelectItem value="การพัฒนาซอฟต์แวร์">การพัฒนาซอฟต์แวร์</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* เขตพื้นที่และเกรด */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="campus">เขตพื้นที่</Label>
                    <p className="text-xs text-muted-foreground mb-1">Campus</p>
                    <Input
                      id="campus"
                      placeholder="เขตพื้นที่ (Campus)"
                      value={userData.campus}
                      onChange={(e) => setUserData({...userData, campus: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpa">เกรดเฉลี่ย</Label>
                    <p className="text-xs text-muted-foreground mb-1">GPAX</p>
                    <Input
                      id="gpa"
                      placeholder="เกรดเฉลี่ย (GPAX)"
                      value={userData.gpa}
                      onChange={(e) => setUserData({...userData, gpa: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: ข้อมูลการติดต่อ */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-medium text-amber-700">ข้อมูลการติดต่อ</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <p className="text-xs text-muted-foreground mb-1">Phone number</p>
                    <Input
                      id="phone"
                      placeholder="เบอร์โทรศัพท์ (Phone number)"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="อีเมล (E-mail)"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: อัปโหลดภาพถ่าย */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-medium text-amber-700">อัปโหลดภาพถ่าย</h3>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-orange-600 font-medium">0 / 1</p>
                      <p className="text-orange-600 text-lg font-medium">Choose a file or drag & drop it here</p>
                      <p className="text-orange-400 text-sm">JPEG and PNG up to 1 MB</p>
                    </div>
                    <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100">
                      Browse File
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <Button 
                    variant="outline" 
                    className="bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    บันทึกแบบร่าง
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกและส่ง'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* การแจ้งเตือน */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <CardDescription>
                เลือกประเภทการแจ้งเตือนที่ต้องการรับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ช่องทางการแจ้งเตือน</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อีเมล</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนทางอีเมล</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notification</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนบนเบราว์เซอร์</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนทาง SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">ประเภทการแจ้งเตือน</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อัปเดตใบสมัคร</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง</p>
                    </div>
                    <Switch
                      checked={notifications.applicationUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, applicationUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>เตือนกำหนดส่ง</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนก่อนถึงกำหนดส่งเอกสาร</p>
                    </div>
                    <Switch
                      checked={notifications.deadlineReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, deadlineReminders: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ข่าวสารระบบ</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนข่าวสารและประกาศจากระบบ</p>
                    </div>
                    <Switch
                      checked={notifications.systemNews}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemNews: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ค่าเริ่มต้น */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                ค่าเริ่มต้น
              </CardTitle>
              <CardDescription>
                ปรับแต่งการแสดงผลและการใช้งานระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    ภาษา
                  </Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ธีม</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">สว่าง</SelectItem>
                      <SelectItem value="dark">มืด</SelectItem>
                      <SelectItem value="system">ตามระบบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>รูปแบบวันที่</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences({...preferences, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thai">แบบไทย (31/12/2567)</SelectItem>
                      <SelectItem value="international">แบบสากล (31/12/2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ความปลอดภัย */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ความปลอดภัย
              </CardTitle>
              <CardDescription>
                จัดการรหัสผ่านและการรักษาความปลอดภัยบัญชี
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">เปลี่ยนรหัสผ่าน</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">การเข้าสู่ระบบล่าสุด</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Chrome บน Windows</p>
                      <p className="text-sm text-muted-foreground">IP: 192.168.1.100</p>
                    </div>
                    <Badge variant="secondary">ปัจจุบัน</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Safari บน iPhone</p>
                      <p className="text-sm text-muted-foreground">IP: 192.168.1.101</p>
                    </div>
                    <p className="text-sm text-muted-foreground">2 ชั่วโมงที่แล้ว</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </Button>
      </div>
    </div>
  );
}