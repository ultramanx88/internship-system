'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Input component not needed in this file
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThaiDateInput } from '@/components/ui/thai-date-input';
import { ArrowLeft, Send, Loader2, Briefcase, GraduationCap, Building, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
// Remove mock data import - we'll use real API
import { parseThaiDate, isThaiDateInPast } from '@/lib/date-utils';
import { DocumentPreview } from '@/components/student/DocumentPreview';
import Link from 'next/link';

interface ApplicationFormData {
  // ข้อมูลพื้นฐาน
  internshipId: string;
  studentReason: string;
  expectedSkills: string;

  // ข้อมูลการฝึกงาน
  preferredStartDate: string;
  availableDuration: string;

  // ข้อมูลเพิ่มเติมสำหรับสหกิจ (เบื้องต้น)
  projectProposal?: string;
}

export default function ApplicationFormTypePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const type = params.type as 'internship' | 'co_op';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [availableInternships, setAvailableInternships] = useState<any[]>([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(true);
  const [formData, setFormData] = useState<ApplicationFormData>({
    internshipId: '',
    studentReason: '',
    expectedSkills: '',
    preferredStartDate: '',
    availableDuration: '',
    projectProposal: ''
  });

  // Pre-select internship if provided in URL
  useEffect(() => {
    const preSelectedInternshipId = searchParams.get('internshipId');
    if (preSelectedInternshipId) {
      setFormData(prev => ({
        ...prev,
        internshipId: preSelectedInternshipId
      }));
    }
  }, [searchParams]);

  // Load internships from API
  useEffect(() => {
    const loadInternships = async () => {
      try {
        setIsLoadingInternships(true);
        const response = await fetch(`/api/internships?type=${type}`);
        const data = await response.json();

        if (data.success) {
          setAvailableInternships(data.internships);
        } else {
          console.error('Failed to load internships:', data.error);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลตำแหน่งฝึกงานได้",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading internships:', error);
        toast({
          title: "ข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInternships(false);
      }
    };

    loadInternships();
  }, [type, toast]);

  // Get selected internship details
  const selectedInternship = availableInternships.find(i => i.id === formData.internshipId);

  // Transform internship data for DocumentPreview (company data already included from API)
  const selectedInternshipWithCompany = selectedInternship ? {
    ...selectedInternship,
    company: selectedInternship.company?.name || selectedInternship.companyId
  } : null;

  const handleInputChange = (field: keyof ApplicationFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field: keyof ApplicationFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    // ตรวจสอบข้อมูลพื้นฐานก่อนแสดงพรีวิว
    if (!formData.internshipId || !formData.studentReason || !formData.preferredStartDate) {
      toast({
        variant: 'destructive',
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลที่จำเป็นก่อนพรีวิวเอกสาร',
      });
      return;
    }

    // ตรวจสอบรูปแบบวันที่
    const startDate = parseThaiDate(formData.preferredStartDate);
    if (!startDate) {
      toast({
        variant: 'destructive',
        title: 'วันที่ไม่ถูกต้อง',
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป',
      });
      return;
    }

    // ตรวจสอบว่าไม่ใช่วันที่ย้อนหลัง
    if (isThaiDateInPast(formData.preferredStartDate)) {
      toast({
        variant: 'destructive',
        title: 'วันที่ไม่ถูกต้อง',
        description: 'ไม่สามารถเลือกวันที่ย้อนหลังจากวันปัจจุบันได้',
      });
      return;
    }

    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาเข้าสู่ระบบก่อนส่งใบสมัคร',
      });
      return;
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.internshipId || !formData.studentReason || !formData.preferredStartDate) {
      toast({
        variant: 'destructive',
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      });
      return;
    }

    // ตรวจสอบรูปแบบวันที่
    const startDate = parseThaiDate(formData.preferredStartDate);
    if (!startDate) {
      toast({
        variant: 'destructive',
        title: 'วันที่ไม่ถูกต้อง',
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป',
      });
      return;
    }

    // ตรวจสอบว่าไม่ใช่วันที่ย้อนหลัง
    if (isThaiDateInPast(formData.preferredStartDate)) {
      toast({
        variant: 'destructive',
        title: 'วันที่ไม่ถูกต้อง',
        description: 'ไม่สามารถเลือกวันที่ย้อนหลังจากวันปัจจุบันได้',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          internshipId: formData.internshipId,
          studentReason: formData.studentReason,
          expectedSkills: formData.expectedSkills,
          preferredStartDate: formData.preferredStartDate,
          availableDuration: formData.availableDuration,
          projectProposal: formData.projectProposal
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'ส่งใบสมัครเรียบร้อยแล้ว',
          description: `ใบสมัคร${type === 'co_op' ? 'สหกิจศึกษา' : 'ฝึกงาน'}ของคุณได้รับการส่งเรียบร้อยแล้ว`,
        });

        // Redirect to applications page
        router.push('/student/applications');
      } else {
        toast({
          variant: 'destructive',
          title: 'ไม่สามารถส่งใบสมัครได้',
          description: data.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeInfo = {
    internship: {
      title: 'ฝึกงาน',
      subtitle: 'Internship',
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      color: 'primary',
      description: 'การฝึกงานระยะสั้น 2-4 เดือน เพื่อเสริมประสบการณ์'
    },
    co_op: {
      title: 'สหกิจศึกษา',
      subtitle: 'Cooperative Education',
      icon: <GraduationCap className="h-6 w-6 text-secondary" />,
      color: 'secondary',
      description: 'การศึกษาแบบสหกิจ 4-6 เดือน นับหน่วยกิต 6 หน่วยกิต'
    }
  };

  const currentType = typeInfo[type];

  if (!currentType) {
    return <div>ประเภทการฝึกงานไม่ถูกต้อง</div>;
  }

  return (
    <div className="space-y-8 text-secondary-600">
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href={selectedInternship ? `/student/internships/${selectedInternship.id}` : "/student/application-form"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {selectedInternship ? "กลับไปดูรายละเอียด" : "กลับไปเลือกประเภท"}
          </Link>
        </Button>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 ${type === 'internship' ? 'bg-primary/10' : 'bg-secondary/20'} rounded-full`}>
            {currentType.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">สมัคร{currentType.title}</h1>
            <p className="text-muted-foreground">{currentType.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Position Selection - Only show if no pre-selected internship */}
        {!selectedInternship ? (
          <Card>
            <CardHeader>
              <CardTitle>เลือกตำแหน่งที่ต้องการสมัคร</CardTitle>
              <CardDescription>
                เลือกตำแหน่ง{currentType.title}ที่เปิดรับสมัครอยู่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="internshipId">ตำแหน่งที่สนใจ *</Label>
                  <Select value={formData.internshipId} onValueChange={handleSelectChange('internshipId')}>
                    <SelectTrigger>
                      <SelectValue placeholder={`เลือกตำแหน่ง${currentType.title}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingInternships ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            กำลังโหลดข้อมูล...
                          </div>
                        </SelectItem>
                      ) : availableInternships.length === 0 ? (
                        <SelectItem value="" disabled>
                          ไม่มีตำแหน่ง{currentType.title}ที่เปิดรับสมัคร
                        </SelectItem>
                      ) : (
                        availableInternships.map(internship => (
                          <SelectItem key={internship.id} value={internship.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{internship.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {internship.company?.name || internship.companyId}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Selected Position Display */
          <Card>
            <CardHeader>
              <CardTitle>ตำแหน่งที่เลือก</CardTitle>
              <CardDescription>
                คุณกำลังสมัครตำแหน่งนี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-primary">{selectedInternship.title}</h4>
                  <Badge variant={selectedInternship.type === 'co_op' ? 'default' : 'secondary'}>
                    {typeInfo[selectedInternship.type].title}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  {selectedInternship.company?.name || selectedInternship.companyId} • {selectedInternship.location}
                </p>
                <p className="text-sm mb-3">{selectedInternship.description}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/student/internships/${selectedInternship.id}`)}
                  >
                    ดูรายละเอียดเพิ่มเติม
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/student/application-form/${type}`)}
                  >
                    เปลี่ยนตำแหน่ง
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดการสมัคร</CardTitle>
            <CardDescription>กรอกข้อมูลเกี่ยวกับการสมัคร{currentType.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="studentReason">เหตุผลในการสมัคร *</Label>
              <Textarea
                id="studentReason"
                value={formData.studentReason}
                onChange={handleInputChange('studentReason')}
                rows={4}
                placeholder={`เหตุผลที่ต้องการ${currentType.title}ในตำแหน่งนี้`}
              />
            </div>

            <div>
              <Label htmlFor="expectedSkills">ทักษะที่คาดหวังจะได้รับ</Label>
              <Textarea
                id="expectedSkills"
                value={formData.expectedSkills}
                onChange={handleInputChange('expectedSkills')}
                rows={3}
                placeholder={`ทักษะหรือประสบการณ์ที่หวังจะได้รับจากการ${currentType.title}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ThaiDateInput
                  id="preferredStartDate"
                  label="วันที่ต้องการเริ่ม"
                  value={formData.preferredStartDate}
                  onChange={(thaiDate) => {
                    setFormData(prev => ({ ...prev, preferredStartDate: thaiDate }));
                    // Clear error when user selects valid date
                    if (thaiDate && !isThaiDateInPast(thaiDate)) {
                      setDateError('');
                    } else if (thaiDate && isThaiDateInPast(thaiDate)) {
                      setDateError('ไม่สามารถเลือกวันที่ย้อนหลังจากวันปัจจุบันได้');
                    }
                  }}
                  required
                  placeholder="วว/ดด/ปปปป"
                  allowPastDates={false}
                  error={dateError}
                />
              </div>
              <div>
                <Label htmlFor="availableDuration">ระยะเวลาที่สามารถ{currentType.title}ได้</Label>
                <Select value={formData.availableDuration} onValueChange={handleSelectChange('availableDuration')}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระยะเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'internship' ? (
                      <>
                        <SelectItem value="2months">2 เดือน</SelectItem>
                        <SelectItem value="3months">3 เดือน</SelectItem>
                        <SelectItem value="4months">4 เดือน</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="4months">4 เดือน</SelectItem>
                        <SelectItem value="5months">5 เดือน</SelectItem>
                        <SelectItem value="6months">6 เดือน</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Workflow Information for Internship */}
            {type === 'internship' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">📋 ขั้นตอนหลังส่งใบสมัคร</h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>อาจารย์ประจำวิชาตรวจสอบใบสมัคร</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>ทางคณะจัดสรรอาจารย์นิเทศ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>ติดต่อประสานงานกับบริษัท</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Co-op Specific Fields */}
        {type === 'co_op' && (
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเพิ่มเติมสำหรับสหกิจศึกษา</CardTitle>
              <CardDescription>ข้อมูลพิเศษสำหรับการสมัครสหกิจศึกษา</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectProposal">หัวข้อโครงการที่เสนอ (เบื้องต้น)</Label>
                <Textarea
                  id="projectProposal"
                  value={formData.projectProposal}
                  onChange={handleInputChange('projectProposal')}
                  rows={4}
                  placeholder="แนวคิดหรือหัวข้อโครงการเบื้องต้นที่สนใจ (สามารถปรับเปลี่ยนได้ภายหลัง)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 หัวข้อนี้เป็นเพียงแนวคิดเบื้องต้น อาจารย์ที่ปรึกษาจะช่วยปรับแต่งให้เหมาะสมภายหลัง
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📋 ข้อมูลที่จะได้รับการจัดสรรภายหลัง</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>อาจารย์ที่ปรึกษา - จะได้รับการมอบหมายจากทางคณะ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>อาจารย์ประจำวิชา - รับผิดชอบดูแลหลักสูตร</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>กรรมการ - ประเมินและติดตามผลงาน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>อาจารย์นิเทศ - เยี่ยมชมและให้คำแนะนำ</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ ทางคณะจะจัดสรรอาจารย์ที่เหมาะสมตามสาขาวิชาและโครงการของคุณ
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                * ข้อมูลที่จำเป็นต้องกรอก
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isSubmitting}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  พรีวิวเอกสาร
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={type === 'internship' ? '' : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่งใบสมัคร...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      ส่งใบสมัคร{currentType.title}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Document Preview Dialog */}
      {selectedInternshipWithCompany && (
        <DocumentPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          formData={formData}
          internship={selectedInternshipWithCompany}
          user={{
            ...user!,
            studentId: user!.id // Use user ID as student ID
          }}
          type={type}
        />
      )}
    </div>
  );
}