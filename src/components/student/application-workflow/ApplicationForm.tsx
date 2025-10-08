'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Send, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ApplicationFormData, 
  WorkflowAPI, 
  WorkflowValidator,
  WorkflowUtils 
} from '@/lib/student-application-workflow';

interface ApplicationFormProps {
  studentId: string;
  initialData?: Partial<ApplicationFormData>;
  onApplicationSubmitted?: (application: any) => void;
  onSave?: (data: ApplicationFormData) => void;
  className?: string;
}

export function ApplicationForm({ 
  studentId, 
  initialData = {}, 
  onApplicationSubmitted,
  onSave,
  className = '' 
}: ApplicationFormProps) {
  const { toast } = useToast();
  const language = WorkflowUtils.detectLanguage();
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    studentId,
    type: 'internship',
    academicYearId: '',
    semesterId: '',
    companyId: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    position: '',
    startDate: '',
    endDate: '',
    workingDays: '',
    workingHours: '',
    salary: '',
    projectTopic: '',
    projectDescription: '',
    projectObjectives: '',
    projectScope: '',
    feedback: '',
    expectations: '',
    skills: '',
    address: {
      province: '',
      district: '',
      subdistrict: '',
      postalCode: '',
      coordinates: { lat: 0, lng: 0 }
    },
    documents: [],
    status: 'draft',
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.academicYearId) {
      loadSemesters(formData.academicYearId);
    }
  }, [formData.academicYearId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [companiesData, academicYearsData] = await Promise.all([
        WorkflowAPI.loadCompanies(),
        WorkflowAPI.loadAcademicYears()
      ]);
      
      setCompanies(companiesData);
      setAcademicYears(academicYearsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(WorkflowUtils.getErrorMessage(error, language));
    } finally {
      setLoading(false);
    }
  };

  const loadSemesters = async (academicYearId: string) => {
    try {
      const semestersData = await WorkflowAPI.loadSemesters(academicYearId);
      setSemesters(semestersData);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressData: Partial<ApplicationFormData['address']>) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...addressData
      }
    }));
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setFormData(prev => ({
        ...prev,
        companyId,
        companyName: company.name || '',
        companyAddress: company.address || '',
        companyPhone: company.phone || '',
        companyEmail: company.email || ''
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const validation = WorkflowValidator.validateApplicationForm(formData);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (onSave) {
        onSave(formData);
      } else {
        await WorkflowAPI.saveApplication(formData);
      }

      setSuccess(language === 'en' ? 'Application saved successfully' : 'บันทึกข้อมูลเรียบร้อยแล้ว');
      toast({
        title: language === 'en' ? 'Success' : 'สำเร็จ',
        description: language === 'en' ? 'Application saved successfully' : 'บันทึกข้อมูลเรียบร้อยแล้ว'
      });
    } catch (error) {
      const errorMessage = WorkflowUtils.getErrorMessage(error, language);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'เกิดข้อผิดพลาด',
        description: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validation = WorkflowValidator.validateApplicationForm(formData);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      const application = await WorkflowAPI.saveApplication(formData);
      await WorkflowAPI.submitApplication(application.id);

      setSuccess(language === 'en' ? 'Application submitted successfully' : 'ส่งคำขอเรียบร้อยแล้ว');
      toast({
        title: language === 'en' ? 'Success' : 'สำเร็จ',
        description: language === 'en' ? 'Application submitted successfully' : 'ส่งคำขอเรียบร้อยแล้ว'
      });

      if (onApplicationSubmitted) {
        onApplicationSubmitted(application);
      }
    } catch (error) {
      const errorMessage = WorkflowUtils.getErrorMessage(error, language);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'เกิดข้อผิดพลาด',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'กำลังโหลด...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {language === 'en' ? 'Application Form' : 'แบบฟอร์มสมัครฝึกงาน'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {language === 'en' ? 'Basic Information' : 'ข้อมูลพื้นฐาน'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">
                {language === 'en' ? 'Type' : 'ประเภท'}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">
                    {language === 'en' ? 'Internship' : 'ฝึกงาน'}
                  </SelectItem>
                  <SelectItem value="coop">
                    {language === 'en' ? 'Co-op' : 'สหกิจศึกษา'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companyId">
                {language === 'en' ? 'Company' : 'บริษัท'}
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select company' : 'เลือกบริษัท'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {language === 'en' ? company.nameEn || company.name : company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {language === 'en' ? 'Project Information' : 'ข้อมูลโปรเจกต์'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectTopic">
                {language === 'en' ? 'Project Topic' : 'หัวข้อโปรเจกต์'} *
              </Label>
              <Input
                id="projectTopic"
                value={formData.projectTopic}
                onChange={(e) => handleInputChange('projectTopic', e.target.value)}
                placeholder={language === 'en' ? 'Enter project topic' : 'กรอกหัวข้อโปรเจกต์'}
              />
            </div>

            <div>
              <Label htmlFor="projectDescription">
                {language === 'en' ? 'Project Description' : 'รายละเอียดโปรเจกต์'}
              </Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder={language === 'en' ? 'Enter project description' : 'กรอกรายละเอียดโปรเจกต์'}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {saving 
              ? (language === 'en' ? 'Saving...' : 'กำลังบันทึก...')
              : (language === 'en' ? 'Save Draft' : 'บันทึกแบบร่าง')
            }
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || saving}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading 
              ? (language === 'en' ? 'Submitting...' : 'กำลังส่ง...')
              : (language === 'en' ? 'Submit Application' : 'ส่งคำขอ')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
