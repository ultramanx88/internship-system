'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  year: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Semester {
  id: string;
  academicYearId: string;
  semester: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear: AcademicYear;
}

export function AcademicManagement() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    setIsLoading(true);
    try {
      const [yearsResponse, semestersResponse] = await Promise.all([
        fetch('/api/academic-years'),
        fetch('/api/semesters')
      ]);

      if (yearsResponse.ok) {
        const yearsData = await yearsResponse.json();
        setAcademicYears(yearsData);
        console.log('Loaded academic years:', yearsData.length);
      } else {
        console.error('Failed to load academic years:', yearsResponse.status);
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลปีการศึกษาได้'
        });
      }

      if (semestersResponse.ok) {
        const semestersData = await semestersResponse.json();
        setSemesters(semestersData);
        console.log('Loaded semesters:', semestersData.length);
      } else {
        console.error('Failed to load semesters:', semestersResponse.status);
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลภาคเรียนได้'
        });
      }
    } catch (error) {
      console.error('Error loading academic data:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลปีการศึกษาได้'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAcademicYear = () => {
    const currentYear = new Date().getFullYear() + 543;
    const newYear = (currentYear + academicYears.length).toString();
    
    setAcademicYears([
      ...academicYears,
      {
        id: `new-${Date.now()}`,
        year: newYear,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  };

  const handleAddSemester = (academicYearId: string) => {
    const academicYear = academicYears.find(y => y.id === academicYearId);
    if (!academicYear) return;

    const existingSemesters = semesters.filter(s => s.academicYearId === academicYearId);
    const nextSemester = (existingSemesters.length + 1).toString();
    
    setSemesters([
      ...semesters,
      {
        id: `new-${Date.now()}`,
        academicYearId,
        semester: nextSemester,
        name: `ภาคเรียนที่ ${nextSemester}/${academicYear.year}`,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isActive: false,
        academicYear
      }
    ]);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academicYears, semesters })
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลปีการศึกษาได้รับการอัปเดตเรียบร้อยแล้ว'
      });

      loadAcademicData();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleYearChange = (id: string, field: 'year' | 'isActive', value: string | boolean) => {
    setAcademicYears(prev => prev.map(year => 
      year.id === id ? { ...year, [field]: value } : year
    ));
  };

  const handleSemesterChange = (id: string, field: string, value: string | boolean) => {
    setSemesters(prev => prev.map(semester => 
      semester.id === id ? { ...semester, [field]: value } : semester
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>จัดการปีการศึกษาและภาคเรียน</CardTitle>
        <CardDescription>
          เพิ่ม, แก้ไข, และจัดการปีการศึกษาและภาคเรียนต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Academic Years Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">ปีการศึกษา</h3>
            <Button variant="outline" size="sm" onClick={handleAddAcademicYear}>
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มปีการศึกษา
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ปีการศึกษา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell>
                      <Input
                        value={year.year}
                        onChange={(e) => handleYearChange(year.id, 'year', e.target.value)}
                        placeholder="เช่น 2567"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={year.isActive ? 'active' : 'inactive'}
                        onValueChange={(value) => handleYearChange(year.id, 'isActive', value === 'active')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">ใช้งาน</SelectItem>
                          <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                        </SelectContent>
                      </Select>
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
        </div>

        {/* Semesters Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">ภาคเรียน</h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ปีการศึกษา</TableHead>
                  <TableHead>ภาคเรียน</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>วันเริ่มต้น</TableHead>
                  <TableHead>วันสิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[100px] text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>{semester.academicYear.year}</TableCell>
                    <TableCell>
                      <Input
                        value={semester.semester}
                        onChange={(e) => handleSemesterChange(semester.id, 'semester', e.target.value)}
                        placeholder="1, 2, 3"
                        className="w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={semester.name}
                        onChange={(e) => handleSemesterChange(semester.id, 'name', e.target.value)}
                        placeholder="ชื่อภาคเรียน"
                      />
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        date={new Date(semester.startDate)}
                        onDateChange={(date) => handleSemesterChange(semester.id, 'startDate', date?.toISOString() || '')}
                      />
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        date={new Date(semester.endDate)}
                        onDateChange={(date) => handleSemesterChange(semester.id, 'endDate', date?.toISOString() || '')}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={semester.isActive ? 'active' : 'inactive'}
                        onValueChange={(value) => handleSemesterChange(semester.id, 'isActive', value === 'active')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">ใช้งาน</SelectItem>
                          <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                        </SelectContent>
                      </Select>
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
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
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
          variant="outline"
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
