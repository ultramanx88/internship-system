'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { registerStudent } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('ที่อยู่อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  studentSkills: z.string().min(10, 'กรุณาระบุทักษะของคุณ'),
  studentStatement: z.string().min(20, 'เรียงความต้องมีอย่างน้อย 20 ตัวอักษร'),
});

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      studentSkills: '',
      studentStatement: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await registerStudent(values);

    if (result.success) {
      toast({
        title: 'ลงทะเบียนสำเร็จ',
        description: 'ยินดีต้อนรับ! ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว',
      });
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'การลงทะเบียนล้มเหลว',
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อเต็ม</FormLabel>
              <FormControl>
                <Input placeholder="สมชาย ใจดี" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสผ่าน</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ทักษะของคุณ</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="เช่น React, Python, Figma, การพูดในที่สาธารณะ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentStatement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เรียงความส่วนตัว</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="บอกเราเกี่ยวกับตัวคุณและสิ่งที่คุณกำลังมองหาในการฝึกงาน"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          <UserPlus />
        </Button>
      </form>
    </Form>
  );
}
