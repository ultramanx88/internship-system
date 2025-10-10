'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddressSelector from '@/components/ui/AddressSelector';
import { AcademicYearSelector, SemesterSelector } from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';

function OSMMap({ lat, lng, onPick }: { lat?: number; lng?: number; onPick: (lat: number, lng: number) => void }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        let mapInstance: any;
        (async () => {
            const leaflet: any = (await import('leaflet')).default;
            const el = containerRef.current as any;
            if (!el || el._leaflet_id) return; // guard double init
            mapInstance = leaflet.map(el).setView([lat || 13.736717, lng || 100.523186], 6);
            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
            let marker: any;
            if (lat && lng) {
                marker = leaflet.marker([lat, lng]).addTo(mapInstance);
            }
            mapInstance.on('click', (e: any) => {
                const { lat, lng } = e.latlng || {};
                if (!lat || !lng) return;
                if (marker) marker.setLatLng([lat, lng]);
                else marker = leaflet.marker([lat, lng]).addTo(mapInstance);
                onPick(lat, lng);
            });
        })();
        return () => {
            try {
                if ((containerRef.current as any)?._leaflet_id && (mapInstance as any)?.remove) {
                    (mapInstance as any).remove();
                }
            } catch {}
        };
    }, [lat, lng, onPick]);
    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}

export default function InternshipFormPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isMapMounted, setIsMapMounted] = useState(false);
    useEffect(() => { setIsMapMounted(true); }, []);
    const [isLoading, setIsLoading] = useState(false);
    const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [subdistricts, setSubdistricts] = useState<any[]>([]);
    const [hasDraftData, setHasDraftData] = useState(false);
    
    const [formData, setFormData] = useState({
        // ข้อมูลบริษัท
        companyRegNumber: '',
        companyName: '',
        companyPhone: '',
        businessType: '',
        // ที่อยู่แบบแยกฟิลด์
        addressNumber: '',
        building: '',
        floor: '',
        soi: '',
        road: '',
        provinceId: '',
        districtId: '',
        subdistrictId: '',
        postalCode: '',
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
        // เหตุผลและหัวข้อโครงการสำหรับคำร้อ
        studentReason: '',
        projectProposal: '',
        latitude: '',
        longitude: '',
        
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

    // handleSaver: บันทึกอัตโนมัติลง localStorage แบบ debounce เมื่อมีการแก้ไข
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('internship-form-draft', JSON.stringify(formData));
            } catch (e) {
                // noop
            }
        }, 800);
        return () => clearTimeout(timer);
        // เก็บร่างเมื่อมีการเปลี่ยนแปลงข้อมูลหลัก ๆ
    }, [formData]);

    // โหลดข้อมูลจังหวัด (ตามภาษา)
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const lang = isEnglish ? 'en' : 'th';
                const response = await fetch(`/api/address/provinces?lang=${lang}`);
                const data = await response.json();
                if (data.success) {
                    setProvinces(data.provinces);
                }
            } catch (error) {
                console.error('Error loading provinces:', error);
            }
        };
        loadProvinces();
        // เมื่อเปลี่ยนภาษา ให้รีเซ็ตเขต/แขวงเพื่อป้องกัน label ไม่ตรงภาษา
        setDistricts([]);
        setSubdistricts([]);
        setFormData(prev => ({ ...prev, districtId: '', subdistrictId: '' }));
    }, [isEnglish]);

    // โหลดข้อมูลแบบร่างจาก localStorage
    useEffect(() => {
        const loadDraftData = () => {
            try {
                const draftData = localStorage.getItem('internship-form-draft');
                if (draftData) {
                    const parsedData = JSON.parse(draftData);
                    setFormData(prev => ({
                        ...prev,
                        ...parsedData
                    }));
                    setHasDraftData(true);
                } else {
                    setHasDraftData(false);
                }
            } catch (error) {
                console.error('Error loading draft data:', error);
                setHasDraftData(false);
            }
        };
        loadDraftData();
    }, []);

    // โหลดข้อมูลอำเภอเมื่อเลือกจังหวัด
    useEffect(() => {
        if (formData.provinceId) {
            const loadDistricts = async () => {
                try {
                    const lang = isEnglish ? 'en' : 'th';
                    const response = await fetch(`/api/address/districts?provinceId=${formData.provinceId}&lang=${lang}`);
                    const data = await response.json();
                    if (data.success) {
                        setDistricts(data.districts);
                        setSubdistricts([]); // รีเซ็ตตำบล
                        setFormData(prev => ({ ...prev, districtId: '', subdistrictId: '' }));
                    }
                } catch (error) {
                    console.error('Error loading districts:', error);
                }
            };
            loadDistricts();
        } else {
            setDistricts([]);
            setSubdistricts([]);
        }
    }, [formData.provinceId, isEnglish]);

    // โหลดข้อมูลตำบลเมื่อเลือกอำเภอ
    useEffect(() => {
        if (formData.districtId) {
            const loadSubdistricts = async () => {
                try {
                    const lang = isEnglish ? 'en' : 'th';
                    const response = await fetch(`/api/address/subdistricts?districtId=${formData.districtId}&lang=${lang}`);
                    const data = await response.json();
                    if (data.success) {
                        setSubdistricts(data.subdistricts);
                        setFormData(prev => ({ ...prev, subdistrictId: '' }));
                    }
                } catch (error) {
                    console.error('Error loading subdistricts:', error);
                }
            };
            loadSubdistricts();
        } else {
            setSubdistricts([]);
        }
    }, [formData.districtId, isEnglish]);

    const handleSave = async () => {
        // บันทึกแบบร่าง - ไม่ต้องตรวจสอบ validation
        setIsLoading(true);
        
        try {
            // บันทึกข้อมูลแบบร่างลง localStorage
            localStorage.setItem('internship-form-draft', JSON.stringify(formData));
            
            // บันทึกข้อมูลแบบร่างลงฐานข้อมูล (ถ้ามี API)
            const response = await fetch('/api/applications/draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    status: 'draft'
                })
            });
            
            if (response.ok) {
                setHasDraftData(true);
                toast({
                    title: isEnglish ? 'Draft saved' : 'บันทึกแบบร่างแล้ว',
                    description: isEnglish ? 'Your draft has been saved.' : 'บันทึกแบบร่างเรียบร้อย',
                });
            } else {
                console.warn('Failed to save draft to database, but saved to localStorage');
                setHasDraftData(true);
                toast({
                    title: isEnglish ? 'Draft saved locally' : 'บันทึกแบบร่างในเครื่อง',
                    description: isEnglish ? 'Saved to your browser storage.' : 'บันทึกลงในเบราว์เซอร์เรียบร้อย',
                });
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            // ยังคงบันทึกใน localStorage แม้ว่าจะมีข้อผิดพลาด
            toast({
                title: isEnglish ? 'Draft saved locally' : 'บันทึกแบบร่างในเครื่อง',
                description: isEnglish ? 'Saved to your browser storage.' : 'บันทึกลงในเบราว์เซอร์เรียบร้อย',
            });
        }
        
        setIsLoading(false);
        router.push('/student/application-form');
    };

    const validateForm = () => {
        // ตรวจสอบค่า minimum ที่จำเป็น (ไม่บังคับเลือก internshipId ในหน้านี้)
        if (!formData.projectProposal || !formData.projectProposal.trim() || !formData.studentReason || !formData.studentReason.trim()) {
            const missing: string[] = [];
            if (!formData.projectProposal?.trim()) missing.push('projectProposal');
            if (!formData.studentReason?.trim()) missing.push('studentReason');
            setErrorFields(new Set(missing));
            return false;
        }
        return true;
    };

    const handleSaveAndSubmit = async (): Promise<boolean> => {
        // Validate form first
        if (!validateForm()) {
            toast({
                variant: 'destructive',
                title: isEnglish ? 'Missing required fields' : 'กรอกข้อมูลไม่ครบ',
                description: isEnglish ? 'Please provide project proposal and reason.' : 'กรุณากรอกหัวข้อโครงการและเหตุผลของคำร้อง',
            });
            return false;
        }

        setIsLoading(true);

        try {
            // เรียก API จริง: สร้างคำขอฝึกงาน
            const lang = isEnglish ? 'en' : 'th';
            const resp = await fetch('/api/applications/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(user?.id ? { 'x-user-id': user.id } : {}) },
                body: JSON.stringify({
                    studentId: user?.id,
                    projectTopic: formData.projectProposal || '',
                    feedback: formData.studentReason || '',
                    position: formData.position || undefined,
                    companyName: formData.companyName || ''
                })
            });

            const data = await resp.json();
            if (!resp.ok || !data.success) {
                const apiMessage = (data?.message || data?.error || '') as string;
                const isProfileIncomplete = apiMessage.toUpperCase() === 'PROFILE_INCOMPLETE' || data?.code === 'PROFILE_INCOMPLETE';
                if (data?.details?.required) {
                    setErrorFields(new Set(data.details.required as string[]));
                }
                // แสดงรายละเอียดฟิลด์โปรไฟล์ที่ขาดหาย (ถ้ามี)
                const missingFields = (data?.details?.missing as string[] | undefined)?.join(', ');
                const description = isProfileIncomplete
                    ? (isEnglish
                        ? `Profile incomplete${missingFields ? `: ${missingFields}` : ''}`
                        : `โปรไฟล์ไม่ครบ${missingFields ? `: ${missingFields}` : ''}`)
                    : (apiMessage || (isEnglish ? 'Cannot create application' : 'ไม่สามารถสร้างคำขอได้'));

                toast({
                    variant: 'destructive',
                    title: isEnglish ? 'Submit failed' : 'ส่งคำขอไม่สำเร็จ',
                    description,
                });

                // กรณีโปรไฟล์ไม่ครบ ให้พาไปหน้า settings พร้อมไฮไลท์ฟิลด์
                if (isProfileIncomplete) {
                    const q = data?.details?.missing ? `?highlight=${encodeURIComponent((data.details.missing as string[]).join(','))}` : '';
                    router.push('/student/settings' + q);
                }
                setIsLoading(false);
                return false;
            }

            // ล้าง draft
            localStorage.removeItem('internship-form-draft');
            setHasDraftData(false);
            toast({
                title: isEnglish ? 'Submitted' : 'ส่งคำขอแล้ว',
                description: isEnglish ? 'Your application has been submitted.' : 'ระบบได้บันทึกและส่งคำขอของคุณแล้ว',
            });
            return true;
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: isEnglish ? 'Submit failed' : 'ส่งคำขอไม่สำเร็จ',
                description: isEnglish ? 'Please try again.' : 'กรุณาลองใหม่อีกครั้ง',
            });
            return false;
        } finally {
            setIsLoading(false);
        }
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

    const handleClearDraft = () => {
        if (confirm(isEnglish ? 'Are you sure you want to clear all draft data?' : 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลแบบร่างทั้งหมด?')) {
            localStorage.removeItem('internship-form-draft');
            setFormData(prev => ({
                ...prev,
                // ข้อมูลบริษัท
                companyRegNumber: '',
                companyName: '',
                companyPhone: '',
                businessType: '',
                // ที่อยู่แบบแยกฟิลด์
                addressNumber: '',
                building: '',
                floor: '',
                soi: '',
                road: '',
                provinceId: '',
                districtId: '',
                subdistrictId: '',
                postalCode: '',
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
                // เหตุผลและหัวข้อโครงการสำหรับคำร้อง
                studentReason: '',
                projectProposal: '',
                latitude: '',
                longitude: '',
                
                // ข้อมูลเพิ่มเติม
                semester: '',
                year: '',
                selectedLanguage: 'thai',
                selectedInternshipType: 'internship'
            }));
            setHasDraftData(false);
            toast({
                title: isEnglish ? 'Draft cleared' : 'ลบแบบร่างแล้ว',
                description: isEnglish ? 'Your draft data has been removed.' : 'ลบข้อมูลแบบร่างเรียบร้อย',
            });
        }
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

			{/* Progress bar could be here (original simple form UI). Removed workflow timeline to restore original behavior. */}

            <div className="max-w-4xl mx-auto">
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">{currentLabels.formTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* แสดงสถานะข้อมูลแบบร่าง */}
                        {hasDraftData && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <p className="text-blue-700 font-medium">
                                        {isEnglish ? 'Draft data loaded' : 'โหลดข้อมูลแบบร่างแล้ว'}
                                    </p>
                                </div>
                                <p className="text-blue-600 text-sm mt-1">
                                    {isEnglish ? 'Your previously saved draft data has been loaded.' : 'ข้อมูลแบบร่างที่บันทึกไว้ก่อนหน้านี้ได้ถูกโหลดแล้ว'}
                                </p>
                            </div>
                        )}

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
                                        <SemesterSelector
                                            academicYearId={formData.year}
                                            value={formData.semester}
                                            onChange={(value) => handleInputChange('semester', value)}
                                            label={currentLabels.semester}
                                            placeholder={isEnglish ? 'Semester' : 'ภาคการศึกษา (Semester)'}
                                        />
                                    </div>
                                    <div>
                                        <AcademicYearSelector
                                            value={formData.year}
                                            onChange={(value) => handleInputChange('year', value)}
                                            label={currentLabels.year}
                                            placeholder={isEnglish ? 'Year' : 'ปีการศึกษา (Year)'}
                                        />
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
                                    <Label htmlFor="companyRegNumber">{currentLabels.companyRegNumber} <span className="text-red-500">*</span></Label>
                                    <p className="text-xs text-muted-foreground mb-1">{isEnglish ? 'Company registration number' : 'Company registration number'}</p>
                                    <Input
                                        id="companyRegNumber"
                                        type="number"
                                        placeholder={isEnglish ? 'Company registration number' : 'เลขทะเบียนบริษัท (Company no.)'}
                                        value={formData.companyRegNumber}
                                        onChange={(e) => handleInputChange('companyRegNumber', e.target.value)}
                                        required
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

                            {/* ที่อยู่แบบแยกฟิลด์ */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-800">{isEnglish ? 'Address Details' : 'รายละเอียดที่อยู่'}</h4>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="addressNumber">{isEnglish ? 'Address Number' : 'เลขที่'}</Label>
                                        <Input
                                            id="addressNumber"
                                            placeholder={isEnglish ? 'Address number' : 'เลขที่'}
                                            value={formData.addressNumber}
                                            onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="building">{isEnglish ? 'Building' : 'อาคาร'}</Label>
                                        <Input
                                            id="building"
                                            placeholder={isEnglish ? 'Building name' : 'อาคาร'}
                                            value={formData.building}
                                            onChange={(e) => handleInputChange('building', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="floor">{isEnglish ? 'Floor' : 'ชั้น'}</Label>
                                        <Input
                                            id="floor"
                                            placeholder={isEnglish ? 'Floor' : 'ชั้น'}
                                            value={formData.floor}
                                            onChange={(e) => handleInputChange('floor', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="soi">{isEnglish ? 'Soi' : 'ซอย'}</Label>
                                        <Input
                                            id="soi"
                                            placeholder={isEnglish ? 'Soi' : 'ซอย'}
                                            value={formData.soi}
                                            onChange={(e) => handleInputChange('soi', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="road">{isEnglish ? 'Road' : 'ถนน'}</Label>
                                    <Input
                                        id="road"
                                        placeholder={isEnglish ? 'Road name' : 'ถนน'}
                                        value={formData.road}
                                        onChange={(e) => handleInputChange('road', e.target.value)}
                                    />
                                </div>

                                <AddressSelector
                                    value={{
                                        provinceId: formData.provinceId,
                                        districtId: formData.districtId,
                                        subdistrictId: formData.subdistrictId,
                                        postalCode: formData.postalCode,
                                    }}
                                    onChange={(v) => setFormData(prev => ({
                                        ...prev,
                                        provinceId: v.provinceId,
                                        districtId: v.districtId,
                                        subdistrictId: v.subdistrictId,
                                        postalCode: v.postalCode || prev.postalCode
                                    }))}
                                    lang={isEnglish ? 'en' : 'th'}
                                    className="mt-2"
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
                                <div className="mt-3 rounded-md overflow-hidden border">
                                    <div className="h-72">
                                        {isMapMounted && (
                                            <OSMMap
                                                lat={formData.latitude ? Number(formData.latitude) : undefined}
                                                lng={formData.longitude ? Number(formData.longitude) : undefined}
                                                onPick={(lat, lng) => {
                                                    handleInputChange('latitude', String(lat));
                                                    handleInputChange('longitude', String(lng));
                                                    handleInputChange('mapUrl', `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`);
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 border-t">
                                        <Input
                                            placeholder="lat"
                                            value={formData.latitude}
                                            onChange={(e) => handleInputChange('latitude', e.target.value)}
                                        />
                                        <Input
                                            placeholder="lng"
                                            value={formData.longitude}
                                            onChange={(e) => handleInputChange('longitude', e.target.value)}
                                        />
                                    </div>
                                </div>
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

                        {/* ส่วนที่ 4: รายละเอียดคำร้อง (จำเป็นตาม business logic) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <h3 className="text-lg font-medium text-amber-700">{isEnglish ? 'Application Details' : 'รายละเอียดคำร้อง'}</h3>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="projectProposal">{isEnglish ? 'Project Proposal' : 'หัวข้อโครงการ'}</Label>
                                    <Textarea
                                        id="projectProposal"
                                        placeholder={isEnglish ? 'Proposed project/topic' : 'หัวข้อหรือรายละเอียดโครงการที่จะทำ'}
                                        value={formData.projectProposal}
                                        onChange={(e) => handleInputChange('projectProposal', e.target.value)}
                                        rows={4}
                                        className={errorFields.has('projectProposal') ? 'border border-red-500' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="studentReason">{isEnglish ? 'Reason' : 'เหตุผลการยื่น'}</Label>
                                    <Textarea
                                        id="studentReason"
                                        placeholder={isEnglish ? 'Why do you apply for this position?' : 'เหตุผลที่ต้องการฝึกงานตำแหน่งนี้'}
                                        value={formData.studentReason}
                                        onChange={(e) => handleInputChange('studentReason', e.target.value)}
                                        rows={4}
                                        className={errorFields.has('studentReason') ? 'border border-red-500' : ''}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-between pt-6 border-t">
                            <Button 
                                variant="outline" 
                                className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                                onClick={handleClearDraft}
                                disabled={isLoading}
                            >
                                {isEnglish ? 'Clear Draft' : 'ลบข้อมูลแบบร่าง'}
                            </Button>
                            <div className="flex gap-4">
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
                                    onClick={handleSaveAndSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...') : currentLabels.saveAndSubmit}
                                </Button>
                            </div>
                        </div>
                        
			{/* Simple Next button to proceed after submit (restore original flow) */}
			<div className="mt-6 pt-6 border-t flex justify-end">
				<Button
					className="bg-amber-600 hover:bg-amber-700"
					onClick={async () => {
						const success = await handleSaveAndSubmit();
						if (success) {
							router.push('/student/application-form');
						}
					}}
					disabled={isLoading}
				>
					{isLoading ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...') : (isEnglish ? 'Next' : 'ถัดไป')}
				</Button>
			</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}