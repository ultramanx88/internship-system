'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CheckCircle2 } from 'lucide-react';

export default function ApplicationFormPage() {
    // ขั้นตอนการยื่นสหกิจศึกษา (หลังจากฝึกงาน / สหกิจศึกษาสำเร็จ)
    const coopSteps = [
        {
            step: 1,
            title: 'ลงทะเบียนข้อมูลนักศึกษา',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'completed',
            isEditable: false,
            buttonText: 'บันทึกแล้ว'
        },
        {
            step: 2,
            title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'completed',
            isEditable: false,
            buttonText: 'บันทึกแล้ว'
        },
        {
            step: 3,
            title: 'ยื่นเอกสารให้กับทางบริษัท',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'completed',
            isEditable: false,
            buttonText: 'ส่งเอกสารสำเร็จ'
        },
        {
            step: 4,
            title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'completed',
            isEditable: false,
            buttonText: 'สำเร็จการสหกิจศึกษา / ฝึกงาน'
        },
        {
            step: 5,
            title: 'กรอกหัวข้อโปรเจกต์',
            date: '7 มิ.ย. 68 - 19 มิ.ย. 68',
            status: 'completed',
            isEditable: false,
            buttonText: 'บันทึกแล้ว'
        }
    ];

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
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-8">
                        {/* Timeline */}
                        <div className="relative">
                            {coopSteps.map((step, index) => (
                                <div key={step.step} className="relative flex items-start mb-8 last:mb-0">
                                    {/* Connecting Line */}
                                    {index < coopSteps.length - 1 && (
                                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-orange-200" />
                                    )}

                                    {/* Step Number Circle */}
                                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${step.status === 'completed'
                                        ? 'bg-orange-500 text-white'
                                        : step.status === 'current'
                                            ? 'bg-orange-400 text-white'
                                            : 'bg-orange-100 text-orange-400'
                                        }`}>
                                        {step.status === 'completed' ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            step.step
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="ml-6 flex-1">
                                        <div className={`p-4 rounded-lg ${step.status === 'current'
                                            ? 'bg-orange-50 border-2 border-orange-200'
                                            : 'bg-gray-50'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className={`font-semibold text-lg ${step.status === 'current' ? 'text-orange-800' : 'text-gray-700'
                                                        }`}>
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                                                </div>

                                                {/* Status Button for All Steps */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${step.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {step.buttonText}
                                                    </span>
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