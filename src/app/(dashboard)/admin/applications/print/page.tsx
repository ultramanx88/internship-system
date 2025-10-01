'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Printer, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type ApplicationData = {
    id: string;
    studentName: string;
    studentId: string;
    major: string;
    companyName: string;
    status: string;
    dateApplied: string;
    isPrinted: boolean;
    printRecord?: {
        id: string;
        documentNumber: string;
        documentDate: string;
        printedAt: string;
    };
};

export default function PrintDocumentsPage() {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentDate, setDocumentDate] = useState<Date>();
    const [selectedLanguage, setSelectedLanguage] = useState<'th' | 'en'>('th');
    const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);
    const [showPrintedOnly, setShowPrintedOnly] = useState(false);
    
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        try {
            const [appsResponse, templatesResponse] = await Promise.all([
                fetch('/api/applications/print'),
                fetch('/api/document-templates')
            ]);
            
            if (!appsResponse.ok || !templatesResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const appsData = await appsResponse.json();
            const templatesData = await templatesResponse.json();
            
            setApplications(appsData.applications || []);
            setAvailableTemplates(templatesData.grouped || []);
        } catch (error) {
            console.error('Fetch data error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลได้',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredApplications = showPrintedOnly 
        ? applications.filter(app => app.isPrinted)
        : applications.filter(app => !app.isPrinted);

    const handleSelectAll = () => {
        if (selectedApplications.size === filteredApplications.length) {
            setSelectedApplications(new Set());
        } else {
            setSelectedApplications(new Set(filteredApplications.map(app => app.id)));
        }
    };

    const handleSelectApplication = (id: string) => {
        const newSelection = new Set(selectedApplications);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedApplications(newSelection);
    };

    const handlePrint = async () => {
        if (selectedApplications.size === 0) {
            toast({
                variant: 'destructive',
                title: 'กรุณาเลือกเอกสาร',
                description: 'กรุณาเลือกเอกสารที่ต้องการพิมพ์',
            });
            return;
        }

        if (!documentNumber.trim()) {
            toast({
                variant: 'destructive',
                title: 'กรุณากรอกเลขที่เอกสาร',
                description: 'กรุณากรอกเลขที่เอกสารก่อนพิมพ์',
            });
            return;
        }

        if (!documentDate) {
            toast({
                variant: 'destructive',
                title: 'กรุณาเลือกวันที่เอกสาร',
                description: 'กรุณาเลือกวันที่เอกสารก่อนพิมพ์',
            });
            return;
        }

        setIsPrinting(true);
        try {
            const response = await fetch('/api/applications/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationIds: Array.from(selectedApplications),
                    documentNumber: documentNumber.trim(),
                    documentDate: documentDate.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to print documents');
            }

            const result = await response.json();

            toast({
                title: 'พิมพ์เอกสารสำเร็จ',
                description: `พิมพ์เอกสาร ${selectedApplications.size} ฉบับ เลขที่ ${documentNumber}`,
            });

            // Reset form
            setSelectedApplications(new Set());
            setDocumentNumber('');
            setDocumentDate(undefined);
            
            // Refresh data
            fetchApplications();

            // Open print dialog (simulate)
            window.print();

        } catch (error) {
            console.error('Print error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถพิมพ์เอกสารได้',
            });
        } finally {
            setIsPrinting(false);
        }
    };

    const handleReprint = async (applicationId: string) => {
        try {
            const response = await fetch(`/api/applications/print/${applicationId}/reprint`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to reprint document');
            }

            toast({
                title: 'พิมพ์ซ้ำสำเร็จ',
                description: 'เอกสารถูกพิมพ์ซ้ำเรียบร้อยแล้ว',
            });

            // Open print dialog (simulate)
            window.print();

        } catch (error) {
            console.error('Reprint error:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถพิมพ์ซ้ำเอกสารได้',
            });
        }
    };

    const isAllSelected = selectedApplications.size === filteredApplications.length && filteredApplications.length > 0;
    const isSomeSelected = selectedApplications.size > 0 && selectedApplications.size < filteredApplications.length;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">พิมพ์เอกสารขอฝึกงาน</h1>
                <p className="text-muted-foreground">จัดการการพิมพ์เอกสารสำหรับธุรการ</p>
            </div>

            {/* Print Form */}
            {!showPrintedOnly && (
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลการพิมพ์</CardTitle>
                        <CardDescription>กรอกข้อมูลสำหรับการพิมพ์เอกสาร</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="documentNumber">เลขที่เอกสาร *</Label>
                                    <Input
                                        id="documentNumber"
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                        placeholder="เช่น DOC-2024-001"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>วันที่เอกสาร *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !documentDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {documentDate ? format(documentDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={documentDate}
                                                onSelect={setDocumentDate}
                                                initialFocus
                                                locale={th}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>ภาษาเอกสาร *</Label>
                                    <Select value={selectedLanguage} onValueChange={(value: 'th' | 'en') => setSelectedLanguage(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="th">ภาษาไทย</SelectItem>
                                            <SelectItem value="en">ภาษาอังกฤษ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button 
                                        onClick={handlePrint}
                                        disabled={selectedApplications.size === 0 || selectedTemplates.size === 0 || isPrinting || !documentNumber.trim() || !documentDate}
                                        className="w-full"
                                    >
                                        {isPrinting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                กำลังพิมพ์...
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="mr-2 h-4 w-4" />
                                                พิมพ์เอกสาร ({selectedApplications.size})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Template Selection */}
                            <div className="space-y-2">
                                <Label>เลือกเอกสารที่ต้องการพิมพ์ *</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                    {availableTemplates
                                        .filter(group => group.language === selectedLanguage)
                                        .map(group => (
                                            <div key={`${group.type}_${group.language}`} className="space-y-2">
                                                <h4 className="font-medium">
                                                    {group.type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
                                                    {group.language === 'en' ? ' (English)' : ' (ไทย)'}
                                                </h4>
                                                {group.templates.map((template: any) => (
                                                    <div key={template.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={template.id}
                                                            checked={selectedTemplates.has(template.id)}
                                                            onCheckedChange={(checked) => {
                                                                const newSelection = new Set(selectedTemplates);
                                                                if (checked) {
                                                                    newSelection.add(template.id);
                                                                } else {
                                                                    newSelection.delete(template.id);
                                                                }
                                                                setSelectedTemplates(newSelection);
                                                            }}
                                                        />
                                                        <Label htmlFor={template.id} className="text-sm">
                                                            {template.name.replace(/^\d+_/, '')} (.{template.format})
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                </div>
                                {selectedTemplates.size === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        กรุณาเลือกเอกสารที่ต้องการพิมพ์อย่างน้อย 1 รายการ
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {showPrintedOnly ? 'เอกสารที่พิมพ์แล้ว' : 'เอกสารรอพิมพ์'}
                            </CardTitle>
                            <CardDescription>
                                {showPrintedOnly 
                                    ? 'รายการเอกสารที่พิมพ์แล้ว สามารถพิมพ์ซ้ำได้'
                                    : 'เลือกเอกสารที่ต้องการพิมพ์'
                                }
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPrintedOnly(!showPrintedOnly)}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {showPrintedOnly ? 'ดูเอกสารรอพิมพ์' : 'ดูเอกสารที่พิมพ์แล้ว'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-600 hover:bg-primary-600">
                                    {!showPrintedOnly && (
                                        <TableHead className="w-[50px] text-white">
                                            <Checkbox
                                                checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                                onCheckedChange={handleSelectAll}
                                                disabled={isLoading || filteredApplications.length === 0}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead className="text-white">รหัสนักศึกษา</TableHead>
                                    <TableHead className="text-white">ชื่อ-สกุล</TableHead>
                                    <TableHead className="text-white">สาขาวิชา</TableHead>
                                    <TableHead className="text-white">บริษัท</TableHead>
                                    {showPrintedOnly && (
                                        <>
                                            <TableHead className="text-white">เลขที่เอกสาร</TableHead>
                                            <TableHead className="text-white">วันที่เอกสาร</TableHead>
                                            <TableHead className="text-white">วันที่พิมพ์</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-center text-white">สถานะ</TableHead>
                                    <TableHead className="text-center text-white">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={showPrintedOnly ? 9 : 6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            กำลังโหลดข้อมูล...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredApplications.length > 0 ? (
                                    filteredApplications.map((app) => (
                                        <TableRow key={app.id}>
                                            {!showPrintedOnly && (
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedApplications.has(app.id)}
                                                        onCheckedChange={() => handleSelectApplication(app.id)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className="font-medium">{app.studentId}</TableCell>
                                            <TableCell>{app.studentName}</TableCell>
                                            <TableCell>{app.major}</TableCell>
                                            <TableCell>{app.companyName}</TableCell>
                                            {showPrintedOnly && app.printRecord && (
                                                <>
                                                    <TableCell>{app.printRecord.documentNumber}</TableCell>
                                                    <TableCell>{format(new Date(app.printRecord.documentDate), 'PPP', { locale: th })}</TableCell>
                                                    <TableCell>{format(new Date(app.printRecord.printedAt), 'PPP', { locale: th })}</TableCell>
                                                </>
                                            )}
                                            <TableCell className="text-center">
                                                <Badge variant={app.isPrinted ? "default" : "secondary"}>
                                                    {app.isPrinted ? 'พิมพ์แล้ว' : 'รอพิมพ์'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {showPrintedOnly ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReprint(app.id)}
                                                    >
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        พิมพ์ซ้ำ
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        เลือกเพื่อพิมพ์
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={showPrintedOnly ? 9 : 6} className="h-24 text-center">
                                            {showPrintedOnly ? 'ไม่มีเอกสารที่พิมพ์แล้ว' : 'ไม่มีเอกสารรอพิมพ์'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}