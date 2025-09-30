'use client';

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
import { Loader2, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { roles as roleData } from '@/lib/permissions';
import type { User, Role } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(2, 'ต้องมีอย่างน้อย 2 ตัวอักษร'),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "คุณต้องเลือกอย่างน้อยหนึ่งตำแหน่ง",
  }),
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
      name: user.name ?? '',
      roles: user.roles as string[] ?? [],
    },
  });

  const { formState, handleSubmit, control } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      toast({
        title: 'อัปเดตผู้ใช้สำเร็จ',
        description: `ข้อมูลของ ${values.name} ได้รับการอัปเดตเรียบร้อยแล้ว`,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อ-สกุล</FormLabel>
              <FormControl>
                <Input placeholder="สมชาย ใจดี" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>อีเมล</FormLabel>
            <FormControl>
                <Input type="email" value={user.email} disabled />
            </FormControl>
            <FormDescription>
                ไม่สามารถแก้ไขอีเมลได้
            </FormDescription>
        </FormItem>
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
