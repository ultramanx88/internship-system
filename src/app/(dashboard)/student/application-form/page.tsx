'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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

    // ตรวจสอบสถานะการฝึกงานของนักศึกษา
    useEffect(() => {
        const checkStudentStatus = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // ตรวจสอบการสมัครฝึกงาน
                const applicationsResponse = await fetch('/api/applications');
                const applicationsData = await applicationsResponse.json();
                
                const myApplications = applicationsData.applications?.filter(
                    (app: any) => app.studentId === user.id
                ) || [];

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
                        status: 'completed',
                        isEditable: false,
                        buttonText: 'บันทึกแล้ว',
                        description: 'กรอกข้อมูลส่วนตัวและติดต่อ'
                    },
                    {
                        step: 2,
                        title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
                        date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
                        status: hasApplied ? 'completed' : 'current',
                        isEditable: !hasApplied,
                        buttonText: hasApplied ? 'บันทึกแล้ว' : 'ดำเนินการ',
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
            } catch (error) {
                console.error('Error checking student status:', error);
                // ใช้ไทม์ไลน์เริ่มต้นหากเกิดข้อผิดพลาด
                setTimelineSteps(getDefaultTimeline());
            } finally {
                setIsLoading(false);
            }
        };

        checkStudentStatus();
    }, [user]);

    // ไทม์ไลน์เริ่มต้นสำหรับนักศึกษาที่ยังไม่ได้สมัคร
    const getDefaultTimeline = (): TimelineStep[] => [
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
    ];

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
                                                                    ? "/student/profile" 
                                                                    : step.step === 2 
                                                                        ? "/student/application-form/internship-form"
                                                                        : "/student/internships"
                                                            }>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {step.step === 2 ? 'ดำเนินการ' : 'เริ่มต้น'}
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