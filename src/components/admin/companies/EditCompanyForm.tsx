'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Company } from '@prisma/client';

interface EditCompanyFormProps {
    companyId: string;
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

export function EditCompanyForm({ companyId }: EditCompanyFormProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        address: '',
        province: '',
        district: '',
        subdistrict: '',
        postalCode: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        industry: '',
        size: '',
        isActive: true,
    });

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchCompany();
    }, [companyId]);

    const fetchCompany = async () => {
        try {
            const response = await fetch(`/api/companies/${companyId}`, {
                headers: {
                    'x-user-id': user?.id || '',
                },
            });
            if (!response.ok) {
                throw new Error('ไม่พบข้อมูลบริษัท');
            }

            const companyData = await response.json();
            setCompany(companyData);
            setFormData({
                name: companyData.name || '',
                nameEn: companyData.nameEn || '',
                address: companyData.address || '',
                province: companyData.province || '',
                district: companyData.district || '',
                subdistrict: companyData.subdistrict || '',
                postalCode: companyData.postalCode || '',
                phone: companyData.phone || '',
                email: companyData.email || '',
                website: companyData.website || '',
                description: companyData.description || '',
                industry: companyData.industry || '',
                size: companyData.size || '',
                isActive: companyData.isActive,
            });
        } catch (error) {
            console.error('Error fetching company:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลบริษัทได้',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
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

        setIsSaving(true);
        try {
            const response = await fetch(`/api/companies/${companyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                },
                body: JSON.stringify({
                    ...formData,
                    size: formData.size || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'เกิดข้อผิดพลาด');
            }

            toast({
                title: 'บันทึกสำเร็จ',
                description: 'ข้อมูลบริษัทถูกอัปเดตเรียบร้อยแล้ว',
            });

            router.push('/admin/companies');
        } catch (error) {
            console.error('Error updating company:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริษัทนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/companies/${companyId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถลบบริษัทได้');
            }

            toast({
                title: 'ลบสำเร็จ',
                description: 'บริษัทถูกลบเรียบร้อยแล้ว',
            });

            router.push('/admin/companies');
        } catch (error) {
            console.error('Error deleting company:', error);
            toast({
                variant: 'destructive',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถลบบริษัทได้',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">ไม่พบข้อมูลบริษัท</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/companies">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับไปรายการบริษัท
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button asChild variant="outline">
                    <Link href="/admin/companies">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับ
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">แก้ไขข้อมูลบริษัท</h1>
                    <p className="text-muted-foreground">{company.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลบริษัท</CardTitle>
                    <CardDescription>แก้ไขข้อมูลสถานประกอบการ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label htmlFor="province">จังหวัด</Label>
                                <Input
                                    id="province"
                                    value={formData.province}
                                    onChange={(e) => handleInputChange('province', e.target.value)}
                                    placeholder="จังหวัด"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">อำเภอ/เขต</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                    placeholder="อำเภอ/เขต"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subdistrict">ตำบล/แขวง</Label>
                                <Input
                                    id="subdistrict"
                                    value={formData.subdistrict}
                                    onChange={(e) => handleInputChange('subdistrict', e.target.value)}
                                    placeholder="ตำบล/แขวง"
                                />
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

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                            />
                            <Label htmlFor="isActive">เปิดใช้งาน</Label>
                        </div>

                        <div className="flex justify-between pt-6">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังลบ...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        ลบบริษัท
                                    </>
                                )}
                            </Button>

                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/companies">ยกเลิก</Link>
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            บันทึก
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}