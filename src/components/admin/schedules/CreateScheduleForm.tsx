'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { users as mockUsers, applications as mockApplications, internships as mockInternships } from '@/lib/data';
import { useEffect } from 'react';

const formSchema = z.object({
  studentId: z.string({ required_error: 'กรุณาเลือกนักศึกษา' }),
  visitorId: z.string({ required_error: 'กรุณาเลือกอาจารย์นิเทศก์' }),
  visitDate: z.date({ required_error: 'กรุณาเลือกวันที่' }),
});

type ScheduleData = {
  id: string;
  studentName: string;
  studentId: string;
  companyName: string;
  teacherName: string;
  visitDate: string;
  scheduleStatus: string;
};

type CreateScheduleFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
  schedule?: ScheduleData | null;
};

// Prepare mock data for form selects
const approvedStudents = mockApplications
  .filter(app => app.status === 'approved')
  .map(app => mockUsers.find(u => u.id === app.studentId))
  .filter(Boolean);

const visitors = mockUsers.filter(u => u.roles.includes('visitor'));

export function CreateScheduleForm({ onSuccess, onCancel, schedule }: CreateScheduleFormProps) {
  const { toast } = useToast();
  const isEditMode = !!schedule;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { formState, handleSubmit, control, reset } = form;

  useEffect(() => {
    if (isEditMode && schedule) {
      // Find the visitor associated with the teacherName
      const visitorUser = visitors.find(v => v.name === schedule.teacherName);
      reset({
        studentId: schedule.studentId,
        visitorId: visitorUser?.id,
        visitDate: schedule.visitDate !== 'ยังไม่ได้นัดหมาย' ? new Date(schedule.visitDate) : undefined,
      });
    } else {
      reset({
        studentId: undefined,
        visitorId: undefined,
        visitDate: undefined,
      });
    }
  }, [schedule, isEditMode, reset]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate API call
    console.log(isEditMode ? 'Updating schedule:' : 'Creating schedule:', values);

    toast({
      title: isEditMode ? 'อัปเดตนัดหมายสำเร็จ' : 'สร้างนัดหมายสำเร็จ',
      description: `ได้บันทึกนัดหมายสำหรับวันที่ ${format(values.visitDate, 'PPP', { locale: th })} เรียบร้อยแล้ว`,
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>นักศึกษา</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักศึกษาที่ต้องการนัดหมาย" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {approvedStudents.map(student => (
                    <SelectItem key={student!.id} value={student!.id}>{student!.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="visitorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อาจารย์นิเทศก์</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอาจารย์ที่จะไปนิเทศ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visitors.map(visitor => (
                    <SelectItem key={visitor.id} value={visitor.id}>{visitor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="visitDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>วันที่นัดหมาย</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: th })
                      ) : (
                        <span>เลือกวันที่</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    locale={th}
                  />
                </PopoverContent>
              </Popover>
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
            {formState.isSubmitting ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกนัดหมาย'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
