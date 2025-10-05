'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { logger, PerformanceMonitor } from '@/lib/logger';
import { studentCache } from '@/lib/cache';

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
            
            if (!user) {
                logger.info('ApplicationFormPage: No user found, skipping status check');
                setIsLoading(false);
                return;
            }

            logger.info('ApplicationFormPage: Checking student status', { 
                userId: user.id, 
                userName: user.name 
            });

            try {
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
                        isEditable: hasApproved,
                        buttonText: hasApproved ? 'ส่งเอกสารสำเร็จ' : (hasApplied ? 'รอการอนุมัติ' : 'รอการสมัคร'),
                        description: 'ส่งเอกสารที่จำเป็นให้บริษัท'
                    },
                    {
                        step: 4,
                        title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasCompleted ? 'completed' : (hasApproved ? 'current' : 'upcoming'),
                        isEditable: hasCompleted,
                        buttonText: hasCompleted ? 'สำเร็จการฝึกงาน' : (hasApproved ? 'กำลังฝึกงาน' : 'รอการอนุมัติ'),
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
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-700">ขั้นตอนฝึกงาน / ขอสหกิจศึกษา</h1>
                        <p className="text-amber-600 font-medium">ยื่นขอสหกิจศึกษา</p>
                        <p className="text-gray-600">ขั้นตอนสหกิจศึกษาของคุณ</p>
                    </div>
                </div>
                
                {/* Current Status Summary */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
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
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-8">
                        {/* Timeline */}
                        <div className="relative">
                            {timelineSteps.map((step, index) => (
                                <div key={step.step} className="relative flex items-start mb-8 last:mb-0">
                                    {/* Connecting Line */}
                                    {index < timelineSteps.length - 1 && (
                                        <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                                            step.status === 'completed' ? 'bg-orange-300' : 'bg-orange-200'
                                        }`} />
                                    )}

                                    {/* Step Number Circle */}
                                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                        step.status === 'completed'
                                        ? 'bg-orange-500 text-white'
                                        : step.status === 'current'
                                                ? 'bg-orange-400 text-white animate-pulse'
                                            : 'bg-orange-100 text-orange-400'
                                        }`}>
                                        {step.status === 'completed' ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : step.status === 'current' ? (
                                            <AlertCircle className="h-5 w-5" />
                                        ) : (
                                            step.step
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="ml-6 flex-1">
                                        <div className={`p-6 rounded-lg transition-all duration-300 ${
                                            step.status === 'current'
                                                ? 'bg-orange-50 border-2 border-orange-200 shadow-md'
                                                : step.status === 'completed'
                                                    ? 'bg-green-50 border border-green-200'
                                                    : 'bg-gray-50 border border-gray-200'
                                        }`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold text-lg mb-2 ${
                                                        step.status === 'current' 
                                                            ? 'text-orange-800' 
                                                            : step.status === 'completed'
                                                                ? 'text-green-800'
                                                                : 'text-gray-700'
                                                        }`}>
                                                        {step.title}
                                                    </h3>
                                                    {step.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                                    )}
                                                    <p className="text-sm text-gray-500">{step.date}</p>
                                                </div>

                                                {/* Status Button */}
                                                <div className="flex items-center gap-3 ml-4">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                        step.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                            : step.status === 'current'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {step.buttonText}
                                                    </span>
                                                    
                                                    {/* Action Button */}
                                                    {step.isEditable && (
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-orange-500 hover:bg-orange-600 text-white"
                                                            asChild
                                                        >
                                                            <Link href={
                                                                step.step === 1 
                                                                    ? "/student/settings" 
                                                                    : step.step === 2 
                                                                        ? "/student/application-form/internship-form"
                                                                        : step.step === 3
                                                                            ? "/student/documents"
                                                                            : step.step === 4
                                                                                ? "/student/internships"
                                                                                : step.step === 5
                                                                                    ? "/student/project-details"
                                                                                    : "/student/dashboard"
                                                            }>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {step.step === 1 ? 'กรอกข้อมูล' : 
                                                                 step.step === 2 ? 'ดำเนินการ' :
                                                                 step.step === 3 ? 'ส่งเอกสาร' :
                                                                 step.step === 4 ? 'ดูสถานะ' :
                                                                 step.step === 5 ? 'กรอกหัวข้อ' : 'เริ่มต้น'}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    
                                                    {step.status === 'completed' && (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}