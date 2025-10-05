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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { roles as roleData } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  id: z.string().min(1, 'Login ID จำเป็นต้องระบุ'),
  email: z.string().optional(), // ไม่บังคับอีเมล์
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "คุณต้องเลือกอย่างน้อยหนึ่งตำแหน่ง",
  }),
  
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
}).refine((data) => {
  // ต้องมีชื่อและนามสกุลอย่างน้อยหนึ่งภาษา
  const hasThaiName = data.t_name && data.t_surname;
  const hasEnglishName = data.e_name && data.e_surname;
  
  return hasThaiName || hasEnglishName;
}, {
  message: "ต้องกรอกชื่อ-นามสกุลภาษาไทย หรือ ชื่อ-นามสกุลภาษาอังกฤษ อย่างน้อยหนึ่งชุด",
  path: ["t_name"], // แสดง error ที่ฟิลด์ชื่อไทย
}).refine((data) => {
  // ถ้ากรอกชื่อไทย ต้องมีคำนำหน้าไทย
  if (data.t_name && !data.t_title) {
    return false;
  }
  return true;
}, {
  message: "ถ้ากรอกชื่อไทย ต้องเลือกคำนำหน้าไทยด้วย",
  path: ["t_title"],
}).refine((data) => {
  // ถ้ากรอกชื่ออังกฤษ ต้องมีคำนำหน้าอังกฤษ
  if (data.e_name && !data.e_title) {
    return false;
  }
  return true;
}, {
  message: "ถ้ากรอกชื่ออังกฤษ ต้องเลือกคำนำหน้าอังกฤษด้วย",
  path: ["e_title"],
});

type AddUserFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      email: '',
      password: '',
      roles: [],
      t_title: '',
      t_name: '',
      t_middle_name: '',
      t_surname: '',
      e_title: '',
      e_name: '',
      e_middle_name: '',
      e_surname: '',
    },
  });

  const { formState, handleSubmit, control } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast({
        title: 'สร้างผู้ใช้สำเร็จ',
        description: `ผู้ใช้ ${values.id} ถูกสร้างเรียบร้อยแล้ว`,
      });
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างผู้ใช้ได้',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
        <FormField
          control={control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login ID (รหัสนักศึกษา/ผู้ใช้) *</FormLabel>
              <FormControl>
                <Input placeholder="65010001 หรือ user_admin001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล (ไม่บังคับ)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@email.com" {...field} />
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
              <FormLabel>รหัสผ่าน *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ข้อมูลภาษาไทย */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium">ข้อมูลภาษาไทย</h3>
          <p className="text-sm text-muted-foreground">
            สำหรับนักศึกษาไทย: กรอกคำนำหน้า ชื่อ และนามสกุลไทย (กรอกภาษาอังกฤษเพิ่มได้)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="t_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำนำหน้า</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          <p className="text-sm text-muted-foreground">
            สำหรับนักศึกษาต่างชาติ: กรอกคำนำหน้า ชื่อ และนามสกุลอังกฤษ
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="e_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel className="text-base">ตำแหน่ง *</FormLabel>
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
                {formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {formState.isSubmitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
