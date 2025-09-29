'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { Role } from '@/lib/types';
import { users } from '@/lib/data';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        const user = login(identifier, password, role);

        if (user) {
            toast({
                title: 'เข้าสู่ระบบสำเร็จ',
                description: `ยินดีต้อนรับกลับ, ${user.name}!`,
            });
            switch (user.role) {
                case 'student':
                    router.push('/student');
                    break;
                case 'teacher':
                    router.push('/teacher');
                    break;
                case 'admin':
                    router.push('/admin');
                    break;
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'เข้าสู่ระบบล้มเหลว',
                description: 'ข้อมูลรับรองไม่ถูกต้องสำหรับบทบาทที่เลือก โปรดลองอีกครั้ง',
            });
            setIsLoading(false);
        }
    }, 500);
  };
  
    const handleUserSelect = (email: string) => {
        const user = users.find(u => u.email === email);
        if (user) {
            setIdentifier(user.email);
            setPassword(user.password || '');
            setRole(user.role);
        }
    }

  return (
    <>
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="identifier">อีเมล หรือ รหัสนักศึกษา</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="student@example.com หรือ รหัสนักศึกษา"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">บทบาท</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger id="role">
            <SelectValue placeholder="เลือกบทบาท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">นักเรียน</SelectItem>
            <SelectItem value="teacher">อาจารย์</SelectItem>
            <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        <LogIn />
      </Button>
    </form>
     <div className="mt-4">
        <Label htmlFor="user-select">หรือเลือกผู้ใช้สาธิต:</Label>
        <Select onValueChange={handleUserSelect}>
          <SelectTrigger id="user-select">
            <SelectValue placeholder="เลือกผู้ใช้สาธิต" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.email}>
                {user.name} ({user.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
