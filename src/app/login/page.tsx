'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Icons } from '@/components/icons';
import { GradientBackground } from '@/components/ui/gradient-background';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function LoginPage() {
  const { logo, loginBackground } = useAppTheme();

  return (
    <GradientBackground 
      variant="login" 
      className="flex min-h-screen w-full flex-col items-center justify-center"
      backgroundUrl={loginBackground || undefined}
    >
      <Card className="w-96 bg-background/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <Icons.logo className="h-12 w-12 text-primary" logoUrl={logo} />
          </div>
          <CardTitle className="text-3xl font-bold">ระบบสหกิจศึกษา</CardTitle>
          <CardDescription>
            เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ดของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              สมัครสมาชิก
            </Link>
          </div>
        </CardContent>
      </Card>
    </GradientBackground>
  );
}
