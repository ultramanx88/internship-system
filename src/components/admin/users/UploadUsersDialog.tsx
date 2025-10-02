'use client';

import { useState, useCallback } from 'react';
import * as xlsx from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type UploadResult = {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  duplicateCount?: number;
  totalRows?: number;
  errors: string[];
};

type UploadUsersDialogProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function UploadUsersDialog({ onSuccess, onCancel }: UploadUsersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
    },
    multiple: false,
  });
  
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = event.target?.result;
            if (!data) {
                throw new Error('Could not read file data.');
            }
            
            let processedData;
            const fileExtension = file.name.toLowerCase().split('.').pop();
            
            if (fileExtension === 'csv') {
                // สำหรับไฟล์ CSV ส่งเป็น text
                const csvText = data as string;
                processedData = { 
                    action: 'upload', 
                    fileType: 'csv',
                    data: csvText 
                };
            } else {
                // สำหรับไฟล์ Excel ส่งเป็น array buffer
                const arrayBuffer = data instanceof ArrayBuffer ? data : new TextEncoder().encode(data as string).buffer;
                processedData = { 
                    action: 'upload', 
                    fileType: 'excel',
                    data: Array.from(new Uint8Array(arrayBuffer)) 
                };
            }

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            const resultData = await response.json();
            if (!response.ok) {
                throw new Error(resultData.message || 'Failed to upload data');
            }

            setResult(resultData);
            toast({
                title: 'อัปโหลดสำเร็จ',
                description: 'ข้อมูลผู้ใช้ได้รับการประมวลผลแล้ว',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาดในการอัปโหลด',
                description: error.message || 'ไม่สามารถประมวลผลไฟล์ได้',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    // อ่านไฟล์ตามประเภท
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension === 'csv') {
        reader.readAsText(file, 'UTF-8');
    } else {
        reader.readAsArrayBuffer(file);
    }
  }
  
  const handleDone = () => {
    if (result && (result.createdCount > 0 || result.updatedCount > 0)) {
        onSuccess();
    } else {
        onCancel();
    }
  }

  return (
    <DialogContent className="sm:max-w-4xl max-w-4xl">
      <DialogHeader>
        <DialogTitle>อัปโหลดรายชื่อผู้ใช้จาก Excel</DialogTitle>
        <DialogDescription>
          เลือกไฟล์ .xlsx, .xls หรือ .csv ที่มีข้อมูลผู้ใช้ตามรูปแบบที่กำหนด
        </DialogDescription>
      </DialogHeader>
      
      {!result ? (
        <div className="space-y-4 py-4">
            <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
            }`}
            >
            <input {...getInputProps()} />
            {file ? (
                <div className="text-center">
                    <File className="mx-auto h-12 w-12 text-foreground" />
                    <p className="mt-2 font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                        <X className="mr-2 h-4 w-4" />
                        ลบไฟล์
                    </Button>
                </div>
            ) : (
                <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 font-semibold">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                <p className="text-sm text-muted-foreground">รองรับไฟล์ .xlsx, .xls และ .csv</p>
                </div>
            )}
            </div>
            <div className="text-xs text-muted-foreground space-y-3">
                <p className="font-semibold">รูปแบบคอลัมน์ที่แนะนำ:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="font-medium">ข้อมูลพื้นฐาน:</p>
                        <div className="space-y-1">
                            <p>• <code className="font-mono bg-muted p-1 rounded">student_id</code> - รหัสนักศึกษา</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">major</code> - สาขาวิชา</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">login_id</code> - ชื่อผู้ใช้</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">password</code> - รหัสผ่าน</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">email</code> - อีเมล</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">role_id</code> - บทบาท</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="font-medium">ชื่อ-นามสกุล (ภาษาไทย):</p>
                        <div className="space-y-1">
                            <p>• <code className="font-mono bg-muted p-1 rounded">t_prefix</code> - คำนำหน้า</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">t_name</code> - ชื่อ</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">t_middle_name</code> - ชื่อกลาง</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">t_surname</code> - นามสกุล</p>
                        </div>
                        
                        <p className="font-medium mt-3">ชื่อ-นามสกุล (ภาษาอังกฤษ):</p>
                        <div className="space-y-1">
                            <p>• <code className="font-mono bg-muted p-1 rounded">e_prefix</code> - คำนำหน้า</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">e_name</code> - ชื่อ</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">e_middle_name</code> - ชื่อกลาง</p>
                            <p>• <code className="font-mono bg-muted p-1 rounded">e_surname</code> - นามสกุล</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800">ตัวอย่างลำดับคอลัมน์ที่แนะนำ:</p>
                    <p className="text-blue-700 mt-1">
                        student_id | major | t_prefix | t_name | t_middle_name | t_surname | e_prefix | e_name | e_middle_name | e_surname | login_id | password | email | role_id
                    </p>
                </div>
            </div>
        </div>
      ) : (
        <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>ประมวลผลเสร็จสิ้น!</AlertTitle>
            <AlertDescription className="space-y-2">
                <p>ทั้งหมด: {result.totalRows || 0} รายการ</p>
                <p>สร้างใหม่: {result.createdCount} รายการ</p>
                <p>อัปเดต: {result.updatedCount} รายการ</p>
                <p>ข้าม: {result.skippedCount} รายการ</p>
                {result.duplicateCount && result.duplicateCount > 0 && (
                    <p className="text-orange-600">ข้อมูลซ้ำ: {result.duplicateCount} รายการ</p>
                )}
                {result.errors.length > 0 && (
                    <div>
                        <p className="font-semibold text-destructive">ข้อผิดพลาด ({result.errors.length} รายการ):</p>
                        <ul className="list-disc pl-5 text-xs max-h-20 overflow-y-auto">
                            {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
            </AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        {!result ? (
            <>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
                    ยกเลิก
                </Button>
                <Button type="button" onClick={handleUpload} disabled={!file || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดและประมวลผล'}
                </Button>
            </>
        ) : (
             <Button type="button" onClick={handleDone}>
                เสร็จสิ้น
            </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
