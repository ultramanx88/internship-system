'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoginForm } from '@/components/auth/LoginForm';
import { Icons } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function LoginPage() {
  const { logo } = useAppTheme();
  const loginImage = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      {loginImage && (
        <Image
          src={loginImage.imageUrl}
          alt={loginImage.description}
          data-ai-hint={loginImage.imageHint}
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 h-full w-full object-cover brightness-50"
        />
      )}
      <Card className="z-10 w-full max-w-md bg-background/80 backdrop-blur-sm">
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
    </div>
  );
}
