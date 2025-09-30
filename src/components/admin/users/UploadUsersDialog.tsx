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
            const workbook = xlsx.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = xlsx.utils.sheet_to_json(worksheet);

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'upload', data: json }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload data');
            }

            const resultData = await response.json();
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
    reader.readAsArrayBuffer(file);
  }
  
  const handleDone = () => {
    if (result && (result.createdCount > 0 || result.updatedCount > 0)) {
        onSuccess();
    } else {
        onCancel();
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>อัปโหลดรายชื่อผู้ใช้จาก Excel</DialogTitle>
        <DialogDescription>
          เลือกไฟล์ .xlsx หรือ .xls ที่มีข้อมูลผู้ใช้ตามรูปแบบที่กำหนด
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
                <p className="text-sm text-muted-foreground">รองรับเฉพาะไฟล์ .xlsx และ .xls</p>
                </div>
            )}
            </div>
             <p className="text-xs text-muted-foreground">
                * ต้องมีคอลัมน์: <code className="font-mono bg-muted p-1 rounded">email</code>, <code className="font-mono bg-muted p-1 rounded">password</code>, <code className="font-mono bg-muted p-1 rounded">roles</code> (คั่นด้วยจุลภาค), และคอลัมน์ชื่อต่างๆ เช่น <code className="font-mono bg-muted p-1 rounded">e_name</code>. คอลัมน์ <code className="font-mono bg-muted p-1 rounded">Login_id</code> (สำหรับรหัสนักศึกษา) เป็นตัวเลือก.
            </p>
        </div>
      ) : (
        <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>ประมวลผลเสร็จสิ้น!</AlertTitle>
            <AlertDescription className="space-y-2">
                <p>สร้างใหม่: {result.createdCount} รายการ</p>
                <p>อัปเดต: {result.updatedCount} รายการ</p>
                <p>ข้าม: {result.skippedCount} รายการ</p>
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
