'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, PlusCircle, Save, Trash2, Loader2 } from 'lucide-react';
import { format, addYears } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AcademicYear {
  id: string;
  year: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  academicYear: AcademicYear;
}

interface Holiday {
  id: string;
  name: string;
  nameEn?: string;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicCalendarProps {
  showHolidays?: boolean;
  title?: string;
  description?: string;
  userRole?: 'admin' | 'staff';
}

export function AcademicCalendar({ 
  showHolidays = true, 
  title = "ปฏิทินการศึกษา",
  description = "จัดการภาคการศึกษา, ระยะเวลา, และวันหยุดต่างๆ ของมหาวิทยาลัย",
  userRole = 'admin'
}: AcademicCalendarProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const promises = [
        fetch('/api/academic-years'),
        fetch('/api/semesters')
      ];

      if (showHolidays) {
        promises.push(fetch('/api/holidays'));
      }

      const [yearsResponse, semestersResponse, holidaysResponse] = await Promise.all(promises);

      if (yearsResponse.ok) {
        const yearsData = await yearsResponse.json();
        setAcademicYears(yearsData.data || []);
      }

      if (semestersResponse.ok) {
        const semestersData = await semestersResponse.json();
        setSemesters(semestersData.data || []);
      }

      if (showHolidays && holidaysResponse?.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลได้'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerm = () => {
    const lastYear = academicYears[academicYears.length - 1];
    const newYear = lastYear ? lastYear.year + 1 : new Date().getFullYear() + 543;
    
    const newAcademicYear: AcademicYear = {
      id: `new-year-${Date.now()}`,
      year: newYear,
      name: `ปีการศึกษา ${newYear}`,
      startDate: null,
      endDate: null,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSemester: Semester = {
      id: `new-semester-${Date.now()}`,
      name: 'ภาคเรียนที่ 1',
      academicYearId: newAcademicYear.id,
      startDate: null,
      endDate: null,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      academicYear: newAcademicYear,
    };

    setAcademicYears([...academicYears, newAcademicYear]);
    setSemesters([...semesters, newSemester]);
  };
  
  const handleAddHoliday = () => {
    const newHoliday: Holiday = {
      id: `new-holiday-${Date.now()}`,
      name: '',
      nameEn: '',
      date: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setHolidays([...holidays, newHoliday]);
  };

  const handleDeleteTerm = async (yearId: string) => {
    try {
      const response = await fetch(`/api/academic-years/${yearId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAcademicYears(academicYears.filter(year => year.id !== yearId));
        setSemesters(semesters.filter(semester => semester.academicYearId !== yearId));
        toast({
          title: 'ลบสำเร็จ',
          description: 'ลบภาคการศึกษาเรียบร้อยแล้ว'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถลบภาคการศึกษาได้'
        });
      }
    } catch (error) {
      console.error('Error deleting term:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบภาคการศึกษาได้'
      });
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    try {
      const response = await fetch(`/api/holidays/${holidayId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHolidays(holidays.filter(holiday => holiday.id !== holidayId));
        toast({
          title: 'ลบสำเร็จ',
          description: 'ลบวันหยุดเรียบร้อยแล้ว'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถลบวันหยุดได้'
        });
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบวันหยุดได้'
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save academic years and semesters
      const academicYearsData = academicYears.map(year => ({
        id: year.id,
        year: year.year,
        name: year.name,
        startDate: year.startDate,
        endDate: year.endDate,
        isActive: year.isActive,
      }));

      const semestersData = semesters.map(semester => ({
        id: semester.id,
        name: semester.name,
        academicYearId: semester.academicYearId,
        startDate: semester.startDate,
        endDate: semester.endDate,
        isActive: semester.isActive,
      }));

      const promises = [
        fetch('/api/academic-years', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            academicYears: academicYearsData,
            semesters: semestersData,
          }),
        })
      ];

      // Save holidays if enabled
      if (showHolidays) {
        const holidaysData = holidays.map(holiday => ({
          id: holiday.id,
          name: holiday.name,
          nameEn: holiday.nameEn || null,
          date: holiday.date,
          isActive: true,
        }));

        promises.push(
          fetch('/api/holidays', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              holidays: holidaysData,
            }),
          })
        );
      }

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        toast({
          title: 'บันทึกสำเร็จ',
          description: 'บันทึกข้อมูลปฏิทินการศึกษาเรียบร้อยแล้ว'
        });
        await loadData(); // Reload data to get updated IDs
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถบันทึกข้อมูลได้'
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
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
                        {academicYears.map((year) => {
                          const yearSemesters = semesters.filter(s => s.academicYearId === year.id);
                          return yearSemesters.map((semester) => (
                            <TableRow key={`${year.id}-${semester.id}`}>
                                <TableCell>{year.year}</TableCell>
                                <TableCell>{semester.name}</TableCell>
                                <TableCell>
                                    <DatePicker 
                                      date={semester.startDate ? new Date(semester.startDate) : new Date()} 
                                      onDateChange={(date) => {
                                        if (date) {
                                          const updatedSemesters = semesters.map(s => 
                                            s.id === semester.id 
                                              ? { ...s, startDate: date.toISOString() }
                                              : s
                                          );
                                          setSemesters(updatedSemesters);
                                        }
                                      }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <DatePicker 
                                      date={semester.endDate ? new Date(semester.endDate) : new Date()} 
                                      onDateChange={(date) => {
                                        if (date) {
                                          const updatedSemesters = semesters.map(s => 
                                            s.id === semester.id 
                                              ? { ...s, endDate: date.toISOString() }
                                              : s
                                          );
                                          setSemesters(updatedSemesters);
                                        }
                                      }}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDeleteTerm(year.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                          ));
                        })}
                    </TableBody>
                </Table>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddTerm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                เพิ่มภาคการศึกษา
            </Button>
        </div>

        {/* Holidays Section - Only show if enabled */}
        {showHolidays && (
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
                                      <DatePicker 
                                        date={new Date(holiday.date)} 
                                        onDateChange={(date) => {
                                          if (date) {
                                            const updatedHolidays = holidays.map(h => 
                                              h.id === holiday.id 
                                                ? { ...h, date: date.toISOString() }
                                                : h
                                            );
                                            setHolidays(updatedHolidays);
                                          }
                                        }}
                                      />
                                  </TableCell>
                                  <TableCell>
                                      <Input 
                                        defaultValue={holiday.name} 
                                        placeholder="เช่น วันปีใหม่"
                                        onChange={(e) => {
                                          const updatedHolidays = holidays.map(h => 
                                            h.id === holiday.id 
                                              ? { ...h, name: e.target.value }
                                              : h
                                          );
                                          setHolidays(updatedHolidays);
                                        }}
                                      />
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDeleteHoliday(holiday.id)}
                                      >
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
        )}

        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
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
