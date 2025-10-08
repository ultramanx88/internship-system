'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { StudentGuard } from '@/components/auth/PermissionGuard';
import { 
  ApplicationForm, 
  WorkflowNavigation 
} from '@/components/student/application-workflow';
import { useStudentWorkflow } from '@/hooks/use-student-workflow';
import { 
  ApplicationFormData, 
  WorkflowUtils 
} from '@/lib/student-application-workflow';

export default function InternshipFormNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    loading,
    error,
    workflowState,
    steps,
    saveApplication,
    submitApplication,
    getCurrentStep,
    language
  } = useStudentWorkflow();

  const [formData, setFormData] = useState<ApplicationFormData>({
    studentId: user?.id || '',
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
    status: 'draft'
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = getCurrentStep();
  const currentStepId = currentStep?.id || 2;

  const handleSave = async (data: ApplicationFormData) => {
    try {
      setSaving(true);
      await saveApplication(data);
      
      toast({
        title: language === 'en' ? 'Success' : 'สำเร็จ',
        description: language === 'en' ? 'Application saved successfully' : 'บันทึกข้อมูลเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'เกิดข้อผิดพลาด',
        description: WorkflowUtils.getErrorMessage(error, language)
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setSubmitting(true);
      const application = await saveApplication(data);
      await submitApplication(application.id);
      
      toast({
        title: language === 'en' ? 'Success' : 'สำเร็จ',
        description: language === 'en' ? 'Application submitted successfully' : 'ส่งคำขอเรียบร้อยแล้ว'
      });
      
      // Navigate back to workflow
      router.push('/student/application-form');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'เกิดข้อผิดพลาด',
        description: WorkflowUtils.getErrorMessage(error, language)
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
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
          </div>
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/application-form">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Back' : 'กลับ'}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'en' ? 'Internship Application Form' : 'แบบฟอร์มสมัครฝึกงาน'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'en' ? 'Fill in your internship application details' : 'กรอกรายละเอียดการสมัครฝึกงาน'}
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Navigation */}
          <WorkflowNavigation
            currentStep={currentStepId}
            totalSteps={steps.length}
            canGoBack={true}
            canGoForward={false}
            onBack={() => router.push('/student/application-form')}
          />

          {/* Application Form */}
          <ApplicationForm
            studentId={user?.id || ''}
            initialData={formData}
            onApplicationSubmitted={handleSubmit}
            onSave={handleSave}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Link href="/student/application-form">
              <Button variant="outline">
                {language === 'en' ? 'Cancel' : 'ยกเลิก'}
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(formData)}
                disabled={saving || submitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving 
                  ? (language === 'en' ? 'Saving...' : 'กำลังบันทึก...')
                  : (language === 'en' ? 'Save Draft' : 'บันทึกแบบร่าง')
                }
              </Button>
              
              <Button
                onClick={() => handleSubmit(formData)}
                disabled={saving || submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting 
                  ? (language === 'en' ? 'Submitting...' : 'กำลังส่ง...')
                  : (language === 'en' ? 'Submit Application' : 'ส่งคำขอ')
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StudentGuard>
  );
}
