'use client';

import { useState, useEffect } from 'react';
import { StudentGuard } from '@/components/auth/PermissionGuard';
import { WorkflowTimeline, WorkflowStatus } from '@/components/student/application-workflow';
import { useStudentWorkflow } from '@/hooks/use-student-workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Globe } from 'lucide-react';

export default function ApplicationFormPage() {
    const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('th');
    
    const {
        loading,
        error,
        workflowState,
        steps,
        refresh,
        getProgressPercentage,
        language: detectedLanguage
    } = useStudentWorkflow();

    // ใช้ภาษา default เป็น thai และให้ user toggle ได้
    const language = currentLanguage;

    // โหลดการตั้งค่าภาษาจาก localStorage
    useEffect(() => {
        const savedLanguage = localStorage.getItem('workflow-language');
        if (savedLanguage === 'en' || savedLanguage === 'th') {
            setCurrentLanguage(savedLanguage);
        }
    }, []);

    // บันทึกการตั้งค่าภาษาเมื่อเปลี่ยน
    const handleLanguageToggle = () => {
        const newLanguage = currentLanguage === 'th' ? 'en' : 'th';
        setCurrentLanguage(newLanguage);
        localStorage.setItem('workflow-language', newLanguage);
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

    if (error) {
        return (
            <StudentGuard>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button
                                        onClick={refresh}
                                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {language === 'en' ? 'Retry' : 'ลองใหม่'}
                                    </button>
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
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            {language === 'en' ? 'Student Application Workflow' : 'ยื่นขอสหกิจศึกษา'}
                        </h1>
                        <div className="flex items-center gap-2">
                            {/* Language Toggle */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLanguageToggle}
                                className="flex items-center gap-2"
                            >
                                <Globe className="h-4 w-4" />
                                {language === 'en' ? 'ไทย' : 'EN'}
                            </Button>
                            
                            {/* Refresh Button */}
                            <Button
                                onClick={refresh}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                {language === 'en' ? 'Refresh' : 'รีเฟรช'}
                            </Button>
                        </div>
                    </div>

                    {/* Workflow Status */}
                    {workflowState && (
                        <WorkflowStatus
                            state={workflowState}
                            totalSteps={steps.length}
                            language={language}
                        />
                    )}

                    {/* Workflow Timeline */}
                    <WorkflowTimeline
                        steps={steps}
                        currentStep={workflowState?.currentStep || 1}
                        language={language}
                    />
                </div>
            </div>
        </StudentGuard>
    );
}