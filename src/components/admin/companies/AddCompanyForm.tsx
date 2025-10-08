'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddCompanyFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const companySizeOptions = [
    { value: 'startup', label: 'สตาร์ทอัพ' },
    { value: 'small', label: 'เล็ก (1-50 คน)' },
    { value: 'medium', label: 'กลาง (51-200 คน)' },
    { value: 'large', label: 'ใหญ่ (201-1000 คน)' },
    { value: 'enterprise', label: 'องค์กรขนาดใหญ่ (1000+ คน)' },
];

const industryOptions = [
    'เทคโนโลยี',
    'การเงิน',
    'การผลิต',
    'การค้าปลีก',
    'การศึกษา',
    'สุขภาพ',
    'การท่องเที่ยว',
    'อสังหาริมทรัพย์',
    'การขนส่ง',
    'อื่นๆ',
];

export function AddCompanyForm({ onSuccess, onCancel }: AddCompanyFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [subdistricts, setSubdistricts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        address: '',
        province: '',
        district: '',
        subdistrict: '',
        provinceId: '',
        districtId: '',
        subdistrictId: '',
        postalCode: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        industry: '',
        size: '',
    });

    const { toast } = useToast();

    // โหลดข้อมูลจังหวัด
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const response = await fetch('/api/address/provinces?lang=th');
                if (response.ok) {
                    const data = await response.json();
                    setProvinces(data.provinces);
                }
            } catch (error) {
                console.error('Error loading provinces:', error);
            }
        };
        loadProvinces();
    }, []);

    // โหลดข้อมูลอำเภอเมื่อเลือกจังหวัด
    useEffect(() => {
        if (formData.provinceId) {
            const loadDistricts = async () => {
                try {
                    const response = await fetch(`/api/address/districts?provinceId=${formData.provinceId}&lang=th`);
                    if (response.ok) {
                        const data = await response.json();
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
    }, [formData.provinceId]);

    // โหลดข้อมูลตำบลเมื่อเลือกอำเภอ
    useEffect(() => {
        if (formData.districtId) {
            const loadSubdistricts = async () => {
                try {
                    const response = await fetch(`/api/address/subdistricts?districtId=${formData.districtId}&lang=th`);
                    if (response.ok) {
                        const data = await response.json();
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
    }, [formData.districtId]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast({
                variant: 'destructive',
                title: 'ข้อมูลไม่ครบถ้วน',
                description: 'กรุณากรอกชื่อบริษัท',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    size: formData.size || null,
                    // ส่งข้อมูล ID แทนชื่อ
                    provinceId: formData.provinceId || null,
                    districtId: formData.districtId || null,
                    subdistrictId: formData.subdistrictId || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'เกิดข้อผิดพลาด');
            }

            toast({
                title: 'เพิ่มบริษัทสำเร็จ',
                description: 'บริษัทใหม่ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว',
            });

            onSuccess();
        } catch (error) {
            console.error('Error adding company:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มบริษัทได้',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">ชื่อบริษัท (ไทย) *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="ชื่อบริษัท"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nameEn">ชื่อบริษัท (อังกฤษ)</Label>
                    <Input
                        id="nameEn"
                        value={formData.nameEn}
                        onChange={(e) => handleInputChange('nameEn', e.target.value)}
                        placeholder="Company Name (English)"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="ที่อยู่บริษัท"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="provinceId">จังหวัด</Label>
                    <Select
                        value={formData.provinceId}
                        onValueChange={(value) => handleInputChange('provinceId', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกจังหวัด" />
                        </SelectTrigger>
                        <SelectContent>
                            {provinces.map((province) => (
                                <SelectItem key={province.id} value={province.id}>
                                    {province.label || province.nameTh}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="districtId">อำเภอ/เขต</Label>
                    <Select
                        value={formData.districtId}
                        onValueChange={(value) => handleInputChange('districtId', value)}
                        disabled={!formData.provinceId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={formData.provinceId ? "เลือกอำเภอ/เขต" : "เลือกจังหวัดก่อน"} />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((district) => (
                                <SelectItem key={district.id} value={district.id}>
                                    {district.label || district.nameTh}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="subdistrictId">ตำบล/แขวง</Label>
                    <Select
                        value={formData.subdistrictId}
                        onValueChange={(value) => handleInputChange('subdistrictId', value)}
                        disabled={!formData.districtId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={formData.districtId ? "เลือกตำบล/แขวง" : "เลือกอำเภอก่อน"} />
                        </SelectTrigger>
                        <SelectContent>
                            {subdistricts.map((subdistrict) => (
                                <SelectItem key={subdistrict.id} value={subdistrict.id}>
                                    {subdistrict.label || subdistrict.nameTh}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                    <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="รหัสไปรษณีย์"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="เบอร์โทรศัพท์"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="อีเมล"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="website">เว็บไซต์</Label>
                <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="industry">อุตสาหกรรม</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกอุตสาหกรรม" />
                        </SelectTrigger>
                        <SelectContent>
                            {industryOptions.map(industry => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="size">ขนาดบริษัท</Label>
                    <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกขนาดบริษัท" />
                        </SelectTrigger>
                        <SelectContent>
                            {companySizeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="รายละเอียดเกี่ยวกับบริษัท"
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    ยกเลิก
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังเพิ่ม...
                        </>
                    ) : (
                        'เพิ่มบริษัท'
                    )}
                </Button>
            </div>
        </form>
    );
}