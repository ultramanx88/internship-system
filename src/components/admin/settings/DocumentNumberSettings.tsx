'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Eye } from 'lucide-react';
import { DocumentTemplate, generateLocalizedDocumentNumber, validateDocumentTemplate } from '@/lib/document-number';
import { toast } from 'sonner';

interface DocumentTemplateConfig {
  thai: DocumentTemplate;
  english: DocumentTemplate;
}

export function DocumentNumberSettings() {
  const [config, setConfig] = useState<DocumentTemplateConfig>({
    thai: {
      prefix: 'DOC',
      digits: 6,
      suffix: '',
      currentNumber: 1
    },
    english: {
      prefix: 'DOC',
      digits: 6,
      suffix: '',
      currentNumber: 1
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/document-template');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error loading document template:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);

      // Validate both templates
      const thaiValidation = validateDocumentTemplate(config.thai);
      const englishValidation = validateDocumentTemplate(config.english);

      if (!thaiValidation.valid || !englishValidation.valid) {
        const errors = [...thaiValidation.errors, ...englishValidation.errors];
        toast.error(`ข้อมูลไม่ถูกต้อง: ${errors.join(', ')}`);
        return;
      }

      const response = await fetch('/api/document-template', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('บันทึกการตั้งค่าเลขเอกสารสำเร็จ');
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving document template:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = (language: 'thai' | 'english', field: keyof DocumentTemplate, value: any) => {
    setConfig(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value
      }
    }));
  };

  const generatePreview = (language: 'thai' | 'english') => {
    return generateLocalizedDocumentNumber(config[language], language);
  };

  const generateNextPreview = (language: 'thai' | 'english') => {
    const nextTemplate = {
      ...config[language],
      currentNumber: config[language].currentNumber + 1
    };
    return generateLocalizedDocumentNumber(nextTemplate, language);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การตั้งค่าเลขเอกสาร</CardTitle>
        <CardDescription>
          กำหนดรูปแบบเลขเอกสารสำหรับเอกสารภาษาไทยและภาษาอังกฤษ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="thai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thai">เอกสารภาษาไทย</TabsTrigger>
            <TabsTrigger value="english">เอกสารภาษาอังกฤษ</TabsTrigger>
          </TabsList>

          <TabsContent value="thai" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="thai-prefix">คำนำหน้า (Prefix)</Label>
                <Input
                  id="thai-prefix"
                  value={config.thai.prefix}
                  onChange={(e) => updateTemplate('thai', 'prefix', e.target.value)}
                  placeholder="เช่น DOC, INT, COOP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thai-digits">จำนวนหลักตัวเลข</Label>
                <Input
                  id="thai-digits"
                  type="number"
                  min="1"
                  max="10"
                  value={config.thai.digits}
                  onChange={(e) => updateTemplate('thai', 'digits', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thai-suffix">คำต่อท้าย (Suffix)</Label>
                <Input
                  id="thai-suffix"
                  value={config.thai.suffix}
                  onChange={(e) => updateTemplate('thai', 'suffix', e.target.value)}
                  placeholder="เช่น /2024, -TH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thai-current">เลขปัจจุบัน</Label>
                <Input
                  id="thai-current"
                  type="number"
                  min="1"
                  value={config.thai.currentNumber}
                  onChange={(e) => updateTemplate('thai', 'currentNumber', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">ตัวอย่างเลขเอกสาร:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>เลขปัจจุบัน: <strong>{generatePreview('thai')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>เลขถัดไป: <strong>{generateNextPreview('thai')}</strong></span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="english" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="english-prefix">Prefix</Label>
                <Input
                  id="english-prefix"
                  value={config.english.prefix}
                  onChange={(e) => updateTemplate('english', 'prefix', e.target.value)}
                  placeholder="e.g. DOC, INT, COOP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="english-digits">Number of Digits</Label>
                <Input
                  id="english-digits"
                  type="number"
                  min="1"
                  max="10"
                  value={config.english.digits}
                  onChange={(e) => updateTemplate('english', 'digits', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="english-suffix">Suffix</Label>
                <Input
                  id="english-suffix"
                  value={config.english.suffix}
                  onChange={(e) => updateTemplate('english', 'suffix', e.target.value)}
                  placeholder="e.g. /2024, -EN"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="english-current">Current Number</Label>
                <Input
                  id="english-current"
                  type="number"
                  min="1"
                  value={config.english.currentNumber}
                  onChange={(e) => updateTemplate('english', 'currentNumber', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Document Number Preview:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Current: <strong>{generatePreview('english')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Next: <strong>{generateNextPreview('english')}</strong></span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6">
          <Button onClick={saveConfiguration} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
