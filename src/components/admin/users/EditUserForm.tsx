'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { roles as roleData } from '@/lib/permissions';
import type { User, Role } from '@prisma/client';

const formSchema = z.object({
  newId: z.string().min(1, 'Login ID จำเป็นต้องระบุ'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "คุณต้องเลือกอย่างน้อยหนึ่งตำแหน่ง",
  }),
  password: z.string().optional(),
  
  // ข้อมูลภาษาไทย
  t_title: z.string().optional(),
  t_name: z.string().optional(),
  t_middle_name: z.string().optional(),
  t_surname: z.string().optional(),
  
  // ข้อมูลภาษาอังกฤษ
  e_title: z.string().optional(),
  e_name: z.string().optional(),
  e_middle_name: z.string().optional(),
  e_surname: z.string().optional(),
});

type EditUserFormProps = {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
};

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newId: user.id ?? '',
      email: user.email ?? '',
      roles: Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]'),
      password: '',
      t_title: (user as any).t_title ?? '',
      t_name: (user as any).t_name ?? '',
      t_middle_name: (user as any).t_middle_name ?? '',
      t_surname: (user as any).t_surname ?? '',
      e_title: (user as any).e_title ?? '',
      e_name: (user as any).e_name ?? '',
      e_middle_name: (user as any).e_middle_name ?? '',
      e_surname: (user as any).e_surname ?? '',
    },
  });

  // Reset form values when user prop changes
  React.useEffect(() => {
    form.reset({
      newId: user.id ?? '',
      email: user.email ?? '',
      roles: Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]'),
      password: '',
      t_title: (user as any).t_title ?? '',
      t_name: (user as any).t_name ?? '',
      t_middle_name: (user as any).t_middle_name ?? '',
      t_surname: (user as any).t_surname ?? '',
      e_title: (user as any).e_title ?? '',
      e_name: (user as any).e_name ?? '',
      e_middle_name: (user as any).e_middle_name ?? '',
      e_surname: (user as any).e_surname ?? '',
    });
  }, [user, form]);

  const { formState, handleSubmit, control } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // ลบ password ออกหากเป็นค่าว่าง
      const submitData = { ...values };
      if (!submitData.password || submitData.password.trim() === '') {
        delete submitData.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const result = await response.json();
      
      toast({
        title: 'อัปเดตผู้ใช้สำเร็จ',
        description: values.newId !== user.id 
          ? `เปลี่ยน Login ID จาก ${user.id} เป็น ${values.newId} และอัปเดตข้อมูลเรียบร้อยแล้ว`
          : `ข้อมูลของ ${values.newId} ได้รับการอัปเดตเรียบร้อยแล้ว`,
      });
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
        <FormField
          control={control}
          name="newId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login ID (รหัสนักศึกษา/ผู้ใช้)</FormLabel>
              <FormControl>
                <Input placeholder="65010001 หรือ user_admin001" {...field} />
              </FormControl>
              <FormDescription>
                สามารถแก้ไข Login ID ได้ แต่ต้องไม่ซ้ำกับผู้ใช้อื่น
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสผ่านใหม่</FormLabel>
              <FormControl>
                <Input type="password" placeholder="ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน" {...field} />
              </FormControl>
              <FormDescription>
                ปล่อยว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ข้อมูลภาษาไทย */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium">ข้อมูลภาษาไทย</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="t_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำนำหน้า</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคำนำหน้า" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="นาย">นาย</SelectItem>
                      <SelectItem value="นาง">นาง</SelectItem>
                      <SelectItem value="นางสาว">นางสาว</SelectItem>
                      <SelectItem value="ผศ.ดร.">ผศ.ดร.</SelectItem>
                      <SelectItem value="รศ.ดร.">รศ.ดร.</SelectItem>
                      <SelectItem value="ศ.ดร.">ศ.ดร.</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="t_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ</FormLabel>
                  <FormControl>
                    <Input placeholder="สมชาย" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="t_middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อกลาง</FormLabel>
                  <FormControl>
                    <Input placeholder="(ถ้ามี)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="t_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>นามสกุล</FormLabel>
                  <FormControl>
                    <Input placeholder="ใจดี" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ข้อมูลภาษาอังกฤษ */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium">ข้อมูลภาษาอังกฤษ</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="e_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                      <SelectItem value="Asst. Prof.">Asst. Prof.</SelectItem>
                      <SelectItem value="Assoc. Prof.">Assoc. Prof.</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="e_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Somchai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="e_middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="(Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="e_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jaidee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


         <FormField
          control={control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">ตำแหน่ง</FormLabel>
                <FormDescription>
                  เลือกตำแหน่งอย่างน้อยหนึ่งตำแหน่งสำหรับผู้ใช้นี้
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
              {roleData.map((item) => (
                <FormField
                  key={item.id}
                  control={control}
                  name="roles"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={formState.isSubmitting}>
                ยกเลิก
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {formState.isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
