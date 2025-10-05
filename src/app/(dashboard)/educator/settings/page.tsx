'use client';

import { EducatorGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function EducatorSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thai, setThai] = useState({ title: '', name: '', middle: '', surname: '' });
  const [eng, setEng] = useState({ title: '', name: '', middle: '', surname: '' });
  const [bio, setBio] = useState('');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({
          thaiTitle: thai.title,
          thaiName: thai.name,
          thaiMiddleName: thai.middle,
          thaiSurname: thai.surname,
          englishTitle: eng.title,
          englishName: eng.name,
          englishMiddleName: eng.middle,
          englishSurname: eng.surname,
          statement: bio,
        })
      });
      if (!res.ok) throw new Error('failed');
      toast({ title: 'บันทึกแล้ว', description: 'อัปเดตข้อมูลสำเร็จ' });
    } catch {
      toast({ variant: 'destructive', title: 'ผิดพลาด', description: 'บันทึกไม่สำเร็จ' });
    }
  };

  const onProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <EducatorGuard>
      <div className="grid gap-8 text-secondary-600">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ตั้งค่าอาจารย์/บุคลากร</h1>
          <p>ข้อมูลภาษาไทย ภาษาอังกฤษ โปรไฟล์ และ Bio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลภาษาไทย</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>คำนำหน้า</Label>
              <Input value={thai.title} onChange={e=>setThai({...thai, title:e.target.value})} />
            </div>
            <div>
              <Label>ชื่อ</Label>
              <Input value={thai.name} onChange={e=>setThai({...thai, name:e.target.value})} />
            </div>
            <div>
              <Label>ชื่อกลาง</Label>
              <Input value={thai.middle} onChange={e=>setThai({...thai, middle:e.target.value})} />
            </div>
            <div>
              <Label>นามสกุล</Label>
              <Input value={thai.surname} onChange={e=>setThai({...thai, surname:e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลภาษาอังกฤษ</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={eng.title} onChange={e=>setEng({...eng, title:e.target.value})} />
            </div>
            <div>
              <Label>First Name</Label>
              <Input value={eng.name} onChange={e=>setEng({...eng, name:e.target.value})} />
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input value={eng.middle} onChange={e=>setEng({...eng, middle:e.target.value})} />
            </div>
            <div>
              <Label>Surname</Label>
              <Input value={eng.surname} onChange={e=>setEng({...eng, surname:e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>โปรไฟล์และ Bio</CardTitle>
            <CardDescription>อัปโหลดรูปโปรไฟล์ และกรอก Bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {profilePreview && <Image src={profilePreview} alt="preview" width={64} height={64} className="rounded-full object-cover" />}
              <Input type="file" accept="image/*" onChange={onProfileChange} className="max-w-sm" />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={5} value={bio} onChange={e=>setBio(e.target.value)} placeholder="แนะนำตัวสั้นๆ หรือประวัติการทำงาน" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </EducatorGuard>
  );
}


