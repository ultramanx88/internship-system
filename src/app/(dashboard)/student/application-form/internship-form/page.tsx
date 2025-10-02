'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';

export default function InternshipFormPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        // ข้อมูลบริษัท
        companyRegNumber: '',
        companyName: '',
        companyPhone: '',
        businessType: '',
        companyAddress: '',
        mapUrl: '',
        duration: '',
        
        // รายละเอียดงาน
        coordinatorName: '',
        coordinatorTel: '',
        coordinatorEmail: '',
        department: '',
        position: '',
        jobDescription: '',
        supervisorName: '',
        supervisorTel: '',
        supervisorEmail: '',
        
        // เอกสารและประเภท
        selectedLanguage: 'thai', // 'thai' หรือ 'english'
        selectedInternshipType: 'internship', // 'internship' หรือ 'cooperative'
        semester: '',
        year: ''
    });

    // ตรวจสอบภาษาที่เลือก
    const isEnglish = formData.selectedLanguage === 'english';
    
    // ข้อความตามภาษา
    const labels = {
        thai: {
            title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
            subtitle: 'กรอกข้อมูลรายละเอียดการฝึกงาน/สหกิจศึกษา',
            formTitle: 'ข้อมูลการฝึกงาน/สหกิจศึกษา',
            documentLanguages: 'เลือกภาษา (Document Languages)',
            selectType: 'เลือกประเภท',
            companyInfo: 'ข้อมูลบริษัท',
            jobDetails: 'รายละเอียดงาน',
            companyRegNumber: 'เลขทะเบียนบริษัท',
            companyName: 'ชื่อบริษัท',
            companyPhone: 'เบอร์โทรบริษัท',
            businessType: 'ประเภทกิจการ',
            companyAddress: 'ที่อยู่บริษัท',
            map: 'แผนที่',
            duration: 'ระยะเวลา',
            companyPictures: 'ภาพบริษัท',
            coordinatorName: 'ชื่อผู้ประสานงาน',
            coordinatorTel: 'เบอร์ติดต่อ',
            coordinatorEmail: 'อีเมล',
            department: 'แผนกงาน',
            position: 'ตำแหน่งงาน',
            jobDescription: 'รายละเอียดงาน',
            supervisorName: 'หัวหน้างาน',
            supervisorTel: 'เบอร์ติดต่อ',
            supervisorEmail: 'อีเมล',
            semester: 'ภาคการศึกษา',
            year: 'ปีการศึกษา',
            saveDraft: 'บันทึกแบบร่าง',
            saveAndSubmit: 'บันทึกและส่ง',
            back: 'กลับ'
        },
        english: {
            title: 'Internship/Co-op Application Form',
            subtitle: 'Fill in internship/co-operative education details',
            formTitle: 'Internship/Co-operative Education Information',
            documentLanguages: 'Select Language (Document Languages)',
            selectType: 'Select Type',
            companyInfo: 'Company Information',
            jobDetails: 'Job Details',
            companyRegNumber: 'Company Registration Number',
            companyName: 'Company Name',
            companyPhone: 'Phone Number',
            businessType: 'Type of Business',
            companyAddress: 'Address',
            map: 'Map',
            duration: 'Duration',
            companyPictures: 'Company Pictures',
            coordinatorName: 'Coordinator Name',
            coordinatorTel: 'Coordinator Tel.',
            coordinatorEmail: 'Coordinator Email',
            department: 'Department',
            position: 'Position',
            jobDescription: 'Job Description',
            supervisorName: 'Supervisor Name',
            supervisorTel: 'Supervisor Tel.',
            supervisorEmail: 'Supervisor Email',
            semester: 'Semester',
            year: 'Year',
            saveDraft: 'Save Draft',
            saveAndSubmit: 'Save and Submit',
            back: 'Back'
        }
    };

    const currentLabels = isEnglish ? labels.english : labels.thai;

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        router.push('/student/application-form');
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLanguageChange = (language: 'thai' | 'english') => {
        setFormData(prev => ({
            ...prev,
            selectedLanguage: language
        }));
    };

    const handleInternshipTypeChange = (type: 'internship' | 'cooperative') => {
        setFormData(prev => ({
            ...prev,
            selectedInternshipType: type
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/student/application-form">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {currentLabels.back}
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-amber-700">{currentLabels.title}</h1>
                        <p className="text-gray-600">{currentLabels.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">{currentLabels.formTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800">{isEnglish ? 'Internship/Co-op Application Form' : 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน'}</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">{currentLabels.documentLanguages}</Label>
                                    <div className="space-y-3 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="thai"
                                                name="language"
                                                checked={formData.selectedLanguage === 'thai'}
                                                onChange={() => handleLanguageChange('thai')}
                                                className="w-4 h-4 text-orange-600 border-orange-300 focus:ring-orange-500"
                                            />
                                            <Label htmlFor="thai">ภาษาไทย (Thai)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="english"
                                                name="language"
                                                checked={formData.selectedLanguage === 'english'}
                                                onChange={() => handleLanguageChange('english')}
                                                className="w-4 h-4 text-orange-600 border-orange-300 focus:ring-orange-500"
                                            />
                                            <Label htmlFor="english">ภาษาอังกฤษ (English)</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <Label className="text-base font-medium">{currentLabels.selectType}</Label>
                                </div>

                                <div className="space-y-3 ml-10">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="internship"
                                            name="internshipType"
                                            checked={formData.selectedInternshipType === 'internship'}
                                            onChange={() => handleInternshipTypeChange('internship')}
                                            className="w-4 h-4 text-orange-600 border-orange-300 focus:ring-orange-500"
                                        />
                                        <Label htmlFor="internship">{isEnglish ? 'Job Internship' : 'ฝึกงาน (Job Internship)'}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="cooperative"
                                            name="internshipType"
                                            checked={formData.selectedInternshipType === 'cooperative'}
                                            onChange={() => handleInternshipTypeChange('cooperative')}
                                            className="w-4 h-4 text-orange-600 border-orange-300 focus:ring-orange-500"
                                        />
                                        <Label htmlFor="cooperative">{isEnglish ? 'Cooperative Education' : 'สหกิจศึกษา (Cooperative)'}</Label>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 ml-10">
                                    <div>
                                        <Label htmlFor="semester">{currentLabels.semester}</Label>
                                        <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Semester' : 'Semester'}</p>
                                        <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isEnglish ? 'Semester' : 'ภาคการศึกษา (Semester)'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">{isEnglish ? 'Semester 1' : 'ภาคการศึกษาที่ 1'}</SelectItem>
                                                <SelectItem value="2">{isEnglish ? 'Semester 2' : 'ภาคการศึกษาที่ 2'}</SelectItem>
                                                <SelectItem value="summer">{isEnglish ? 'Summer' : 'ภาคฤดูร้อน'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="year">{currentLabels.year}</Label>
                                        <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Year' : 'Year'}</p>
                                        <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isEnglish ? 'Year' : 'ปีการศึกษา (Year)'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2567">2567</SelectItem>
                                                <SelectItem value="2568">2568</SelectItem>
                                                <SelectItem value="2569">2569</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ส่วนที่ 2: ข้อมูลบริษัท */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <h3 className="text-lg font-medium text-amber-700">{currentLabels.companyInfo}</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="companyRegNumber">{currentLabels.companyRegNumber}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Company registration number' : 'Company registration number'}</p>
                                    <Input
                                        id="companyRegNumber"
                                        placeholder={isEnglish ? 'Company registration number' : 'เลขทะเบียนบริษัท (Company no.)'}
                                        value={formData.companyRegNumber}
                                        onChange={(e) => handleInputChange('companyRegNumber', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyName">{currentLabels.companyName}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Company name' : 'Company name'}</p>
                                    <Input
                                        id="companyName"
                                        placeholder={isEnglish ? 'Company name' : 'ชื่อบริษัท (Company name)'}
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyPhone">{currentLabels.companyPhone}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Phone number' : 'Phone number'}</p>
                                    <Input
                                        id="companyPhone"
                                        placeholder={isEnglish ? 'Phone number' : 'เบอร์โทรศัพท์ (Phone number)'}
                                        value={formData.companyPhone}
                                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="businessType">{currentLabels.businessType}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Type of business' : 'Type of business'}</p>
                                <Input
                                    id="businessType"
                                    placeholder={isEnglish ? 'Type of business' : 'ประเภทกิจการ (Type of business)'}
                                    value={formData.businessType}
                                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="companyAddress">{currentLabels.companyAddress}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Address' : 'Address'}</p>
                                <Textarea
                                    id="companyAddress"
                                    placeholder={isEnglish ? 'Company address' : 'ที่อยู่บริษัท (Address)'}
                                    value={formData.companyAddress}
                                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="mapUrl">{currentLabels.map}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Map' : 'Map'}</p>
                                <Input
                                    id="mapUrl"
                                    placeholder="Google Map URL"
                                    value={formData.mapUrl}
                                    onChange={(e) => handleInputChange('mapUrl', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="duration">{currentLabels.duration}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Duration' : 'Duration'}</p>
                                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isEnglish ? 'Duration' : 'ระยะเวลา (duration)'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2months">{isEnglish ? '2 months' : '2 เดือน'}</SelectItem>
                                        <SelectItem value="3months">{isEnglish ? '3 months' : '3 เดือน'}</SelectItem>
                                        <SelectItem value="4months">{isEnglish ? '4 months' : '4 เดือน'}</SelectItem>
                                        <SelectItem value="6months">{isEnglish ? '6 months' : '6 เดือน'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{currentLabels.companyPictures}</Label>
                                <p className="text-xs text-muted-foreground mb-2">{isEnglish ? 'Company pictures' : 'Company pictures'}</p>
                                
                                <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                                            <Camera className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-orange-600 font-medium">0 / 2</p>
                                            <p className="text-orange-600 text-lg font-medium">{isEnglish ? 'Choose a file or drag & drop it here' : 'Choose a file or drag & drop it here'}</p>
                                            <p className="text-orange-400 text-sm">{isEnglish ? 'JPEG and PNG up to 1 MB' : 'JPEG and PNG up to 1 MB'}</p>
                                        </div>
                                        <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100">
                                            {isEnglish ? 'Browse File' : 'Browse File'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ส่วนที่ 3: รายละเอียดงาน */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <h3 className="text-lg font-medium text-amber-700">{currentLabels.jobDetails}</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="coordinatorName">{currentLabels.coordinatorName}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Coordinator' : 'Coordinator'}</p>
                                    <Input
                                        id="coordinatorName"
                                        placeholder={isEnglish ? 'Coordinator name' : 'ชื่อผู้ประสานงาน (Coordinator)'}
                                        value={formData.coordinatorName}
                                        onChange={(e) => handleInputChange('coordinatorName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coordinatorTel">{currentLabels.coordinatorTel}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Coordinator tel.' : 'Coordinator tel.'}</p>
                                    <Input
                                        id="coordinatorTel"
                                        placeholder={isEnglish ? 'Coordinator telephone' : 'เบอร์ติดต่อ (Coordinator tel.)'}
                                        value={formData.coordinatorTel}
                                        onChange={(e) => handleInputChange('coordinatorTel', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coordinatorEmail">{currentLabels.coordinatorEmail}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Coordinator email' : 'Coordinator email'}</p>
                                    <Input
                                        id="coordinatorEmail"
                                        placeholder={isEnglish ? 'Coordinator email' : 'อีเมล (Coordinator email)'}
                                        value={formData.coordinatorEmail}
                                        onChange={(e) => handleInputChange('coordinatorEmail', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="department">{currentLabels.department}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Department' : 'Department'}</p>
                                    <Input
                                        id="department"
                                        placeholder={isEnglish ? 'Department' : 'แผนกงาน (Department)'}
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="position">{currentLabels.position}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Position' : 'Position'}</p>
                                    <Input
                                        id="position"
                                        placeholder={isEnglish ? 'Position' : 'ตำแหน่งงาน (Position)'}
                                        value={formData.position}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="jobDescription">{currentLabels.jobDescription}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Job Description' : 'Job Description'}</p>
                                <Textarea
                                    id="jobDescription"
                                    placeholder={isEnglish ? 'Job description details' : 'รายละเอียดงาน (Job Description)'}
                                    value={formData.jobDescription}
                                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="supervisorName">{currentLabels.supervisorName}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Supervisor name' : 'Supervisor name'}</p>
                                    <Input
                                        id="supervisorName"
                                        placeholder={isEnglish ? 'Supervisor name' : 'หัวหน้างาน (Supervisor name)'}
                                        value={formData.supervisorName}
                                        onChange={(e) => handleInputChange('supervisorName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supervisorTel">{currentLabels.supervisorTel}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Supervisor tel.' : 'Supervisor tel.'}</p>
                                    <Input
                                        id="supervisorTel"
                                        placeholder={isEnglish ? 'Supervisor telephone' : 'เบอร์ติดต่อ (Supervisor tel.)'}
                                        value={formData.supervisorTel}
                                        onChange={(e) => handleInputChange('supervisorTel', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supervisorEmail">{currentLabels.supervisorEmail}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Supervisor email' : 'Supervisor email'}</p>
                                    <Input
                                        id="supervisorEmail"
                                        placeholder={isEnglish ? 'Supervisor email' : 'อีเมล (Supervisor email)'}
                                        value={formData.supervisorEmail}
                                        onChange={(e) => handleInputChange('supervisorEmail', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button 
                                variant="outline" 
                                className="bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {currentLabels.saveDraft}
                            </Button>
                            <Button 
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...') : currentLabels.saveAndSubmit}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}