import Link from 'next/link';
import { Icons } from '@/components/icons';
import { RegisterForm } from '@/components/auth/RegisterForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
         <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Icons.logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">สร้างบัญชี</CardTitle>
          <CardDescription>
            เข้าร่วม InternshipFlow ในฐานะนักเรียนและค้นหาโอกาสครั้งต่อไปของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
