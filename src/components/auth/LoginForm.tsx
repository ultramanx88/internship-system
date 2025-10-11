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
import { LogIn, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Role } from '@prisma/client';
import { demoUsers } from '@/lib/demo-users';
import { RoleSelector } from './RoleSelector';
// import { useSystemSettings } from '@/hooks/use-system-settings';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);

  // Check if demo users should be shown based on localStorage and environment
  const shouldShowDemoUsers = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && localStorage.getItem('demo_users_toggle') === 'true');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ตรวจสอบข้อมูลผู้ใช้โดยไม่ระบุ role
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const user = data.user;
        
        // ถ้ามีหลาย role ให้แสดง role selector
        if (user.roles.length > 1) {
          setUserRoles(user.roles);
          setUserName(user.name);
          setShowRoleSelector(true);
          toast({
            title: 'ตรวจสอบข้อมูลสำเร็จ',
            description: `ยินดีต้อนรับ, ${user.name}! กรุณาเลือกบทบาทที่ต้องการใช้งาน`,
          });
        } else {
          // ถ้ามี role เดียว ให้เข้าสู่ระบบทันที
          const selectedRole = user.roles[0];
          const loginResult = await login(identifier, password, selectedRole);
          
          if (loginResult) {
            toast({
              title: 'เข้าสู่ระบบสำเร็จ',
              description: `ยินดีต้อนรับกลับ, ${loginResult.name}!`,
            });
            
            // Navigate based on role
            if (loginResult.roles.includes('admin')) {
              router.push('/admin');
            } else if (loginResult.roles.includes('courseInstructor') || loginResult.roles.includes('committee') || loginResult.roles.includes('อาจารย์ประจำวิชา') || loginResult.roles.includes('อาจารย์นิเทศก์') || loginResult.roles.includes('กรรมการ')) {
              router.push('/educator');
            } else if (loginResult.roles.includes('student')) {
              router.push('/student');
            } else if (loginResult.roles.includes('staff')) {
              router.push('/staff');
            } else {
              router.push('/admin');
            }
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'เข้าสู่ระบบล้มเหลว',
          description: data.message || 'ข้อมูลรับรองไม่ถูกต้อง โปรดลองอีกครั้ง',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง';
      toast({
        variant: 'destructive',
        title: 'เข้าสู่ระบบล้มเหลว',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole: Role) => {
    try {
      const user = await login(identifier, password, selectedRole);
      
      if (user) {
        toast({
          title: 'เข้าสู่ระบบสำเร็จ',
          description: `ยินดีต้อนรับกลับ, ${user.name}!`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง',
      });
    }
  };
  
  const handleUserSelect = (email: string) => {
    const user = demoUsers.find(u => u.email === email);
    if (user) {
      setIdentifier(user.email);
      setPassword(user.password || '123456');
    }
  }

  if (showRoleSelector && userRoles.length > 0) {
    return (
      <RoleSelector 
        userRoles={userRoles}
        userName={userName}
        onRoleSelect={handleRoleSelect}
      />
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="identifier">รหัสผู้ใช้ หรือ อีเมล</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="รหัสนักศึกษา, อีเมล หรือ รหัสผู้ใช้"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        <LogIn />
      </Button>
    </form>
    
    {shouldShowDemoUsers && (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="user-select" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            หรือเลือกผู้ใช้สาธิต:
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDemoUsers(!showDemoUsers)}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {showDemoUsers ? (
              <>
                <ChevronUp className="w-4 h-4" />
                ซ่อน
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                แสดง
              </>
            )}
          </Button>
        </div>
        
        {showDemoUsers && (
          <div className="mt-2">
            <Select onValueChange={handleUserSelect} disabled={isLoading}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="เลือกผู้ใช้สาธิต" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {demoUsers?.filter(user => user?.id && user?.email && user?.name).map(user => (
                  <SelectItem key={user.id} value={user.email}>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    )}
    </>
  );
}
