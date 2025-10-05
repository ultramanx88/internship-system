'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { logger, PerformanceMonitor } from '@/lib/logger';
import { studentCache } from '@/lib/cache';
import { StudentGuard } from '@/components/auth/PermissionGuard';

interface TimelineStep {
    step: number;
    title: string;
    date: string;
    status: 'completed' | 'current' | 'upcoming';
    isEditable: boolean;
    buttonText: string;
    description?: string;
}

export default function ApplicationFormPage() {
    const { user } = useAuth();
    const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStudentRegistered, setIsStudentRegistered] = useState(false);

    // ตรวจสอบสถานะการฝึกงานของนักศึกษา
    useEffect(() => {
        const checkStudentStatus = async () => {
            const perfMonitor = new PerformanceMonitor('ApplicationFormPage:checkStudentStatus');
            
            try {
                if (!user) {
                    logger.info('ApplicationFormPage: No user found, skipping status check');
                    setIsLoading(false);
                    return;
                }

                logger.info('ApplicationFormPage: Checking student status', { 
                    userId: user.id, 
                    userName: user.name 
                });

                // ตรวจสอบการลงทะเบียนข้อมูลนักศึกษา
                const studentRegistered = user.name && user.email && user.phone && 
                                        user.t_name && user.t_surname && 
                                        user.facultyId && user.majorId;
                
                logger.info('ApplicationFormPage: Student registration status', { 
                    userId: user.id,
                    isRegistered: studentRegistered,
                    missingFields: {
                        name: !user.name,
                        email: !user.email,
                        phone: !user.phone,
                        t_name: !user.t_name,
                        t_surname: !user.t_surname,
                        facultyId: !user.facultyId,
                        majorId: !user.majorId
                    }
                });
                
                setIsStudentRegistered(studentRegistered);
                
                // ตรวจสอบการสมัครฝึกงาน
                logger.info('ApplicationFormPage: Fetching applications', { userId: user.id });
                
                // Check cache first
                const cacheKey = `applications_${user.id}`;
                let applicationsData = studentCache.get(cacheKey);
                
                if (!applicationsData) {
                    const applicationsResponse = await fetch('/api/applications');
                    applicationsData = await applicationsResponse.json();
                    
                    // Cache for 5 minutes
                    studentCache.set(cacheKey, applicationsData, 300);
                    logger.info('ApplicationFormPage: Applications cached', { 
                        userId: user.id,
                        cacheKey 
                    });
                } else {
                    logger.info('ApplicationFormPage: Applications loaded from cache', { 
                        userId: user.id,
                        cacheKey 
                    });
                }
                
                const myApplications = applicationsData.applications?.filter(
                    (app: any) => app.studentId === user.id
                ) || [];

                logger.info('ApplicationFormPage: Applications found', { 
                    userId: user.id,
                    totalApplications: myApplications.length,
                    applicationStatuses: myApplications.map((app: any) => app.status)
                });

                // ตรวจสอบสถานะการฝึกงาน
                const hasApplied = myApplications.length > 0;
                const hasApproved = myApplications.some((app: any) => app.status === 'approved');
                const hasCompleted = myApplications.some((app: any) => app.status === 'completed');

                // สร้างไทม์ไลน์ตามสถานะ
                const steps: TimelineStep[] = [
                    {
                        step: 1,
                        title: 'ลงทะเบียนข้อมูลนักศึกษา',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: studentRegistered ? 'completed' : 'current',
                        isEditable: !studentRegistered,
                        buttonText: studentRegistered ? 'บันทึกแล้ว' : 'กรอกข้อมูล',
                        description: 'กรอกข้อมูลส่วนตัวและติดต่อ'
                    },
                    {
                        step: 2,
                        title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasApplied ? 'completed' : (studentRegistered ? 'current' : 'upcoming'),
                        isEditable: studentRegistered && !hasApplied,
                        buttonText: hasApplied ? 'บันทึกแล้ว' : (studentRegistered ? 'ดำเนินการ' : 'รอการลงทะเบียน'),
                        description: 'เลือกประเภทการฝึกงานและบริษัทที่ต้องการ'
                    },
                    {
                        step: 3,
                        title: 'ยื่นเอกสารให้กับทางบริษัท',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasApproved ? 'completed' : (hasApplied ? 'current' : 'upcoming'),
                        isEditable: hasApplied && !hasApproved,
                        buttonText: hasApproved ? 'ส่งแล้ว' : (hasApplied ? 'ดำเนินการ' : 'รอการสมัคร'),
                        description: 'ส่งเอกสารที่จำเป็นให้บริษัท'
                    },
                    {
                        step: 4,
                        title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasCompleted ? 'completed' : (hasApproved ? 'current' : 'upcoming'),
                        isEditable: hasApproved && !hasCompleted,
                        buttonText: hasCompleted ? 'เสร็จสิ้น' : (hasApproved ? 'กำลังฝึกงาน' : 'รอการอนุมัติ'),
                        description: 'ปฏิบัติงานตามที่ได้รับมอบหมาย'
                    },
                    {
                        step: 5,
                        title: 'กรอกหัวข้อโปรเจกต์',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasCompleted ? 'current' : 'upcoming',
                        isEditable: hasCompleted,
                        buttonText: hasCompleted ? 'กรอกหัวข้อ' : 'รอการฝึกงาน',
                        description: 'สรุปผลงานและหัวข้อโปรเจกต์'
                    }
                ];

                setTimelineSteps(steps);
                
                logger.info('ApplicationFormPage: Timeline steps created', { 
                    userId: user.id,
                    stepsCount: steps.length,
                    currentStep: steps.find(step => step.status === 'current')?.step,
                    completedSteps: steps.filter(step => step.status === 'completed').length
                });
            } catch (error) {
                logger.error('ApplicationFormPage: Error checking student status', { 
                    userId: user?.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                });
                // ใช้ไทม์ไลน์เริ่มต้นหากเกิดข้อผิดพลาด
                setTimelineSteps(getDefaultTimeline());
            } finally {
                perfMonitor.end();
                setIsLoading(false);
            }
        };

        checkStudentStatus();
    }, [user]);

    // ไทม์ไลน์เริ่มต้นสำหรับนักศึกษาที่ยังไม่ได้สมัคร
    // Memoize default timeline to prevent recreation on every render
    const getDefaultTimeline = useCallback((): TimelineStep[] => [
        {
            step: 1,
            title: 'ลงทะเบียนข้อมูลนักศึกษา',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'current',
            isEditable: true,
            buttonText: 'กรอกข้อมูล',
            description: 'กรอกข้อมูลส่วนตัวและติดต่อ'
        },
        {
            step: 2,
            title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'upcoming',
            isEditable: false,
            buttonText: 'รอการลงทะเบียน',
            description: 'เลือกประเภทการฝึกงานและบริษัทที่ต้องการ'
        },
        {
            step: 3,
            title: 'ยื่นเอกสารให้กับทางบริษัท',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'upcoming',
            isEditable: false,
            buttonText: 'รอการสมัคร',
            description: 'ส่งเอกสารที่จำเป็นให้บริษัท'
        },
        {
            step: 4,
            title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'upcoming',
            isEditable: false,
            buttonText: 'รอการอนุมัติ',
            description: 'ปฏิบัติงานตามที่ได้รับมอบหมาย'
        },
        {
            step: 5,
            title: 'กรอกหัวข้อโปรเจกต์',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'upcoming',
            isEditable: false,
            buttonText: 'รอการฝึกงาน',
            description: 'สรุปผลงานและหัวข้อโปรเจกต์'
        }
    ], []);

    // Track page load
    useEffect(() => {
        logger.info('ApplicationFormPage: Page loaded', {
            userId: user?.id,
            timestamp: new Date().toISOString()
        });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <StudentGuard>
            <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-700">ขั้นตอนฝึกงาน / ขอสหกิจศึกษา</h1>
                        <p className="text-gray-600 mt-1">ติดตามความคืบหน้าของการสมัครฝึกงานหรือสหกิจศึกษา</p>
                    </div>
                </div>
            </div>

            {/* Current Status Summary */}
            <div className="bg-white rounded-lg p-4 shadow-sm border mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <div>
                        <h3 className="font-semibold text-gray-800">สถานะปัจจุบัน</h3>
                        <p className="text-sm text-gray-600">
                            {timelineSteps.find(step => step.status === 'current')?.title || 'กำลังตรวจสอบสถานะ...'}
                        </p>
                    </div>
                </div>

                {/* แสดงสถานะการลงทะเบียน */}
                {user && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isStudentRegistered ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">
                                {isStudentRegistered ? 'ข้อมูลนักศึกษาครบถ้วน' : 'กรุณากรอกข้อมูลนักศึกษาให้ครบถ้วน'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                {timelineSteps.map((step, index) => (
                    <Card key={step.step} className={`transition-all duration-200 ${
                        step.status === 'current' ? 'ring-2 ring-orange-400 shadow-lg' : 
                        step.status === 'completed' ? 'bg-green-50 border-green-200' : 
                        'bg-gray-50 border-gray-200'
                    }`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                        step.status === 'completed' ? 'bg-green-500' :
                                        step.status === 'current' ? 'bg-orange-500' :
                                        'bg-gray-400'
                                    }`}>
                                        {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : step.step}
                                    </div>
                                    <div>
                                        <CardTitle className={`text-lg ${
                                            step.status === 'completed' ? 'text-green-800' :
                                            step.status === 'current' ? 'text-orange-800' :
                                            'text-gray-600'
                                        }`}>
                                            {step.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                        step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        step.status === 'current' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {step.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                                        {step.status === 'current' && <Clock className="w-4 h-4" />}
                                        {step.status === 'upcoming' && <AlertCircle className="w-4 h-4" />}
                                        {step.status === 'completed' ? 'เสร็จสิ้น' :
                                         step.status === 'current' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-600 mb-4">{step.description}</p>
                                    {step.status === 'current' && (
                                        <div className="flex items-center gap-2 text-orange-600 text-sm">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                            <span>ขั้นตอนนี้พร้อมให้ดำเนินการ</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <Link href={
                                        step.step === 1 ? "/student/settings" :           // ลงทะเบียนข้อมูล
                                        step.step === 2 ? "/student/application-form/internship-form" : // กรอกข้อมูลสหกิจศึกษา
                                        step.step === 3 ? "/student/documents" :          // ส่งเอกสาร
                                        step.step === 4 ? "/student/internships" :        // ดูสถานะ
                                        step.step === 5 ? "/student/project-details" :    // กรอกหัวข้อ
                                        "/student/dashboard"
                                    }>
                                        <Button 
                                            variant={step.isEditable ? "default" : "outline"}
                                            size="sm"
                                            disabled={!step.isEditable}
                                            className={`${
                                                step.isEditable ? 'bg-orange-600 hover:bg-orange-700' : ''
                                            }`}
                                        >
                                            {step.isEditable && <Edit className="w-4 h-4 mr-2" />}
                                            {step.buttonText}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        </StudentGuard>
    );
}