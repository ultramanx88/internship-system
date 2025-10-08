"use client";

import { useState, useRef } from 'react';
import { useSystemMedia, SystemMedia } from '@/hooks/use-system-media';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  FileImage,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

export default function SystemMediaPage() {
  const {
    systemMedia,
    isLoading,
    error,
    uploadSystemMedia,
    deleteSystemMedia,
    activateSystemMedia,
    getActiveMediaByType,
    getMediaByType,
    clearError
  } = useSystemMedia();

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [activating, setActivating] = useState<{ [key: string]: boolean }>({});
  const [selectedType, setSelectedType] = useState<'logo' | 'background' | 'favicon'>('logo');
  
  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    background: useRef<HTMLInputElement>(null),
    favicon: useRef<HTMLInputElement>(null)
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'background' | 'favicon') => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    
    try {
      const result = await uploadSystemMedia(file, type, 'admin'); // TODO: Get actual user ID
      
      if (result.success) {
        alert(result.message || 'อัปโหลดสำเร็จ');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      // Clear file input
      if (fileInputRefs[type].current) {
        fileInputRefs[type].current.value = '';
      }
    }
  };

  const handleFileDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?')) return;

    setDeleting(prev => ({ ...prev, [id]: true }));
    
    try {
      const result = await deleteSystemMedia(id);
      
      if (result.success) {
        alert(result.message || 'ลบสำเร็จ');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleActivate = async (id: string) => {
    setActivating(prev => ({ ...prev, [id]: true }));
    
    try {
      const result = await activateSystemMedia(id);
      
      if (result.success) {
        alert(result.message || 'เปิดใช้งานสำเร็จ');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเปิดใช้งาน');
      }
    } catch (error) {
      console.error('Activate error:', error);
      alert('เกิดข้อผิดพลาดในการเปิดใช้งาน');
    } finally {
      setActivating(prev => ({ ...prev, [id]: false }));
    }
  };

  const renderMediaCard = (media: SystemMedia) => (
    <Card key={media.id} className={`${media.isActive ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-sm">{media.originalName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {media.isActive && (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                ใช้งานอยู่
              </Badge>
            )}
            <Badge variant="outline">
              {media.type === 'logo' ? 'โลโก้' : 
               media.type === 'background' ? 'พื้นหลัง' : 'Favicon'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>ขนาด: {formatBytes(media.fileSize)}</span>
            <span>{media.mimeType}</span>
          </div>
          
          {media.width && media.height && (
            <div className="text-sm text-gray-600">
              ขนาด: {media.width} × {media.height} px
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            อัปโหลดเมื่อ: {formatDate(media.createdAt)}
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(media.filePath, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              ดู
            </Button>
            
            {!media.isActive && (
              <Button
                size="sm"
                onClick={() => handleActivate(media.id)}
                disabled={activating[media.id]}
              >
                {activating[media.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                เปิดใช้งาน
              </Button>
            )}
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleFileDelete(media.id)}
              disabled={deleting[media.id]}
            >
              {deleting[media.id] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              ลบ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUploadSection = (type: 'logo' | 'background' | 'favicon') => {
    const activeMedia = getActiveMediaByType(type);
    const allMedia = getMediaByType(type);
    
    return (
      <div className="space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              อัปโหลด{type === 'logo' ? 'โลโก้' : type === 'background' ? 'ภาพพื้นหลัง' : 'Favicon'}ใหม่
            </CardTitle>
            <CardDescription>
              {type === 'logo' && 'รองรับไฟล์ JPG, PNG, WebP, SVG ขนาดไม่เกิน 2MB'}
              {type === 'background' && 'รองรับไฟล์ JPG, PNG, WebP, SVG ขนาดไม่เกิน 5MB'}
              {type === 'favicon' && 'รองรับไฟล์ ICO, PNG ขนาดไม่เกิน 2MB'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRefs[type]}
                type="file"
                accept={type === 'favicon' ? '.ico,.png' : '.jpg,.jpeg,.png,.webp,.svg'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, type);
                }}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRefs[type].current?.click()}
                disabled={uploading[type]}
              >
                {uploading[type] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                เลือกไฟล์
              </Button>
              
              {activeMedia && (
                <div className="text-sm text-gray-600">
                  ไฟล์ปัจจุบัน: {activeMedia.originalName}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Files */}
        {allMedia.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              ไฟล์{type === 'logo' ? 'โลโก้' : type === 'background' ? 'ภาพพื้นหลัง' : 'Favicon'}ทั้งหมด
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMedia.map(renderMediaCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการไฟล์ระบบ</h1>
        <p className="text-gray-600 mt-2">
          จัดการโลโก้, ภาพพื้นหลัง, และ favicon ของระบบ
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={clearError}
            >
              ปิด
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logo">โลโก้</TabsTrigger>
          <TabsTrigger value="background">ภาพพื้นหลัง</TabsTrigger>
          <TabsTrigger value="favicon">Favicon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logo">
          {renderUploadSection('logo')}
        </TabsContent>
        
        <TabsContent value="background">
          {renderUploadSection('background')}
        </TabsContent>
        
        <TabsContent value="favicon">
          {renderUploadSection('favicon')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
