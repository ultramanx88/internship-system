'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailsPage() {
    const [projectChoice, setProjectChoice] = useState('do-project');
    const [isFormSaved, setIsFormSaved] = useState(false);

    // Form data states
    const [formData, setFormData] = useState({
        projectName: '',
        projectInfo: '',
        objective: '',
        software: '',
        reasons: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        setIsFormSaved(true);
    };





    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/student/application-form">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-amber-700">รายละเอียดโปรเจค</h1>
                        <p className="text-gray-600">จัดการและอัปเดตข้อมูลโปรเจคของคุณ</p>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-4xl mx-auto mb-4">
                <p className="text-amber-700 text-sm">
                    รายละเอียดโปรเจกต์ &gt; แจ้งหัวข้อโปรเจกต์
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* ข้อมูลส่วนตัว */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลส่วนตัว</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-amber-700 font-medium">ชื่อจริง-นามสกุล (Full-name) : </span>
                                <span className="text-gray-900">นายรักดี จิตดี</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">รหัสนักศึกษา (Student ID) : </span>
                                <span className="text-gray-900">6400112233</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">ประเภท (Type) : </span>
                                <span className="text-gray-900">ฝึกงาน</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">ชื่อบริษัท (Company) : </span>
                                <span className="text-gray-900">บริษัท ABC จำกัด</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">เลขทะเบียนบริษัท (Registration no.) : </span>
                                <span className="text-gray-900">0105547002456</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">แผนก (Department) : </span>
                                <span className="text-gray-900">IT</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">ตำแหน่ง (Position) : </span>
                                <span className="text-gray-900">IT</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">ระยะเวลา (Duration) : </span>
                                <span className="text-gray-900">15 มิ.ย. 2568 - 15 ต.ค. 2568</span>
                            </div>
                            <div>
                                <span className="text-amber-700 font-medium">อาจารย์นิเทศ (Academic advisor) : </span>
                                <span className="text-gray-900">อาจารย์ A</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-amber-700 font-medium">ที่อยู่บริษัท (Address) : </span>
                                <span className="text-gray-900">1/11 ถ.สุขุม อ.เมือง จ.เชียงใหม่</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* กรุณาเลือก Section */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-semibold text-sm">
                                1
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800">กรุณาเลือก</h2>
                        </div>

                        <div className="mt-4 ml-12">
                            <RadioGroup value={projectChoice} onValueChange={setProjectChoice} className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="do-project" id="do-project" className="text-amber-600" />
                                    <Label htmlFor="do-project" className="text-gray-700 cursor-pointer">
                                        ทำโปรเจกต์
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="no-project" id="no-project" className="text-amber-600" />
                                    <Label htmlFor="no-project" className="text-gray-700 cursor-pointer">
                                        ไม่ทำโปรเจกต์
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* Saved Project Display */}
                {isFormSaved && projectChoice === 'do-project' && formData.projectName && (
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">แจ้งหัวข้อโปรเจกต์</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-amber-700">โปรเจกต์ของฉัน</h3>

                                <div className="p-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg text-white">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold">หัวข้อ : </span>
                                            <span>{formData.projectName}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">รายละเอียด : </span>
                                            <span className="text-sm">{formData.projectInfo}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button className="bg-amber-600 hover:bg-amber-700">
                                    แก้ไข
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Conditional Sections based on radio selection */}
                {!isFormSaved && projectChoice === 'no-project' && (
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">อธิบายเหตุผล</CardTitle>
                            <p className="text-sm text-gray-600">Reasons</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="reasons" className="text-gray-700">อธิบายเหตุผล (Reasons)</Label>
                                <Textarea
                                    id="reasons"
                                    placeholder="อธิบายเหตุผล (Reasons)"
                                    className="mt-2"
                                    rows={4}
                                    value={formData.reasons}
                                    onChange={(e) => handleInputChange('reasons', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
                                    บันทึกแบบร่าง
                                </Button>
                                <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
                                    บันทึกและส่ง
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isFormSaved && projectChoice === 'do-project' && (
                    <>
                        {/* กรอกรายละเอียดโปรเจกต์ */}
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-amber-700">กรอกรายละเอียดโปรเจกต์</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* รายละเอียดทั่วไป */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-semibold text-sm">
                                        2
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">รายละเอียดทั่วไป</h3>
                                </div>

                                <div className="ml-12 space-y-4">
                                    <div>
                                        <Label htmlFor="projectName" className="text-gray-700">หัวข้อโปรเจกต์</Label>
                                        <p className="text-sm text-gray-600 mb-2">Project name</p>
                                        <Input
                                            id="projectName"
                                            placeholder="หัวข้อโปรเจกต์(Project name)"
                                            className="w-full"
                                            value={formData.projectName}
                                            onChange={(e) => handleInputChange('projectName', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="projectInfo" className="text-gray-700">รายละเอียดโดยสังเขป</Label>
                                        <p className="text-sm text-gray-600 mb-2">Information</p>
                                        <Textarea
                                            id="projectInfo"
                                            placeholder="รายละเอียดโดยสังเขป (Information)"
                                            rows={6}
                                            className="w-full"
                                            value={formData.projectInfo}
                                            onChange={(e) => handleInputChange('projectInfo', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="objective" className="text-gray-700">เป้าหมายของโปรเจกต์</Label>
                                        <p className="text-sm text-gray-600 mb-2">Objective</p>
                                        <Textarea
                                            id="objective"
                                            placeholder="เป้าหมายของโปรเจกต์ (Objective)"
                                            rows={6}
                                            className="w-full"
                                            value={formData.objective}
                                            onChange={(e) => handleInputChange('objective', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* เทคโนโลยี / เครื่องมือที่ใช้ */}
                        <Card className="bg-white shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-semibold text-sm">
                                        3
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">เทคโนโลยี / เครื่องมือที่ใช้</h3>
                                </div>

                                <div className="ml-12 space-y-4">
                                    <div>
                                        <Label htmlFor="software" className="text-gray-700">เครื่องมือที่ใช้</Label>
                                        <p className="text-sm text-gray-600 mb-2">Software</p>
                                        <Input
                                            id="software"
                                            placeholder="เครื่องมือที่ใช้ (Software)"
                                            className="w-full"
                                            value={formData.software}
                                            onChange={(e) => handleInputChange('software', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
                                            บันทึกแบบร่าง
                                        </Button>
                                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
                                            บันทึกและส่ง
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" asChild>
                        <Link href="/student/application-form">
                            กลับไปไทม์ไลน์
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}