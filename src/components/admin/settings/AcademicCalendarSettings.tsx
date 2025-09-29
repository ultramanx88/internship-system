'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, PlusCircle, Save, Trash2 } from 'lucide-react';
import { academicTerms as initialTerms, holidays as initialHolidays } from '@/lib/data';
import { format, addYears } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AcademicCalendarSettings() {
  const [terms, setTerms] = useState(initialTerms);
  const [holidays, setHolidays] = useState(initialHolidays);

  const handleAddTerm = () => {
    const lastTerm = terms[terms.length - 1];
    const newYear = lastTerm ? (lastTerm.semester === '2' ? lastTerm.year + 1 : lastTerm.year) : new Date().getFullYear() + 543;
    const newSemester = lastTerm ? (lastTerm.semester === '1' ? '2' : '1') : '1';
    
    setTerms([
      ...terms,
      {
        id: `term-${terms.length + 1}`,
        year: newYear,
        semester: newSemester,
        startDate: new Date(),
        endDate: new Date(),
      },
    ]);
  };
  
  const handleAddHoliday = () => {
    setHolidays([
        ...holidays,
        {
            id: `holiday-${holidays.length + 1}`,
            name: '',
            date: new Date(),
        }
    ])
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ปฏิทินการศึกษา</CardTitle>
        <CardDescription>
          จัดการภาคการศึกษา, ระยะเวลา, และวันหยุดต่างๆ ของมหาวิทยาลัย
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Academic Terms Section */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-foreground">ภาคการศึกษา</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ปีการศึกษา</TableHead>
                            <TableHead>ภาคการศึกษา</TableHead>
                            <TableHead>วันเริ่มต้น</TableHead>
                            <TableHead>วันสิ้นสุด</TableHead>
                            <TableHead className="text-right">ดำเนินการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {terms.map((term) => (
                            <TableRow key={term.id}>
                                <TableCell>{term.year}</TableCell>
                                <TableCell>{term.semester}</TableCell>
                                <TableCell>
                                    <DatePicker date={term.startDate} />
                                </TableCell>
                                <TableCell>
                                    <DatePicker date={term.endDate} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddTerm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มภาคการศึกษา
            </Button>
        </div>

        {/* Holidays Section */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-foreground">วันหยุดนักขัตฤกษ์</h3>
             <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ชื่อวันหยุด</TableHead>
                            <TableHead className="text-right">ดำเนินการ</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {holidays.map((holiday) => (
                            <TableRow key={holiday.id}>
                                <TableCell>
                                    <DatePicker date={holiday.date} />
                                </TableCell>
                                <TableCell>
                                    <Input defaultValue={holiday.name} placeholder="เช่น วันปีใหม่"/>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddHoliday}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มวันหยุด
            </Button>
        </div>

        <div className="flex justify-end">
            <Button>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการตั้งค่าปฏิทิน
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DatePicker({ date, onDateChange }: { date: Date, onDateChange?: (date?: Date) => void }) {
    const [selectedDate, setSelectedDate] = useState(date);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(newDate) => {
                        setSelectedDate(newDate!);
                        onDateChange?.(newDate);
                    }}
                    initialFocus
                    locale={th}
                    defaultMonth={selectedDate}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear()}
                    toYear={addYears(new Date(), 5).getFullYear()}
                />
            </PopoverContent>
        </Popover>
    );
}