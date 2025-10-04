'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import OpenStreetMap from '@/components/map/OpenStreetMap';

interface EvaluationData {
  id: string;
  studentId: string;
  companyId: string;
  internshipId?: string;
  status: string;
  submittedAt?: string;
  company: {
    id: string;
    name: string;
    nameEn?: string;
    addressNumber?: string;
    building?: string;
    floor?: string;
    soi?: string;
    road?: string;
    postalCode?: string;
    mapUrl?: string;
    phone?: string;
    email?: string;
    website?: string;
    province?: {
      nameTh: string;
      nameEn?: string;
    };
    district?: {
      nameTh: string;
      nameEn?: string;
    };
    subdistrict?: {
      nameTh: string;
      nameEn?: string;
    };
  };
  internship?: {
    id: string;
    title: string;
    location: string;
    description: string;
    type: string;
  };
  evaluationForm: {
    id: string;
    title: string;
    description?: string;
    questions?: Array<{
      id: string;
      question: string;
      questionType: string;
      order: number;
    }>;
  };
  answers: Array<{
    id: string;
    questionId: string;
    answerValue: string;
    answerText?: string | undefined;
    question: {
      id: string;
      question: string;
      questionType: string;
      order: number;
    };
  }>;
}

export default function EvaluationFormPage() {
  const params = useParams();
  const companyId = params?.companyId as string;
  const { toast } = useToast();
  const router = useRouter();

  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('');

  // Load evaluation data
  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/evaluations?companyId=${companyId}`);
        const data = await response.json();
        
        if (data.success && data.evaluations.length > 0) {
          const evalData = data.evaluations[0];
          setEvaluation(evalData);
          
          // Initialize scores from existing answers
      const initialScores: Record<string, number | null> = {};
          evalData.answers.forEach((answer: any) => {
            if (answer.question.questionType === 'rating') {
              initialScores[answer.questionId] = parseInt(answer.answerValue) || null;
            }
      });
      setScores(initialScores);
          
          // Load map coordinates if company has address
          if (evalData.company.addressNumber || evalData.company.road) {
            await loadMapCoordinates(evalData.company);
          }

          // Set initial address selections
          if (evalData.company.provinceId) {
            setSelectedProvince(evalData.company.provinceId);
          }
          if (evalData.company.districtId) {
            setSelectedDistrict(evalData.company.districtId);
          }
          if (evalData.company.subdistrictId) {
            setSelectedSubdistrict(evalData.company.subdistrictId);
          }
        } else {
          // Create new evaluation if none exists
          await createNewEvaluation();
        }
      } catch (error) {
        console.error('Error loading evaluation:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการประเมินได้",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvaluation();
  }, [companyId, toast]);

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch('/api/address/provinces');
        const data = await response.json();
        if (data.success) {
          setProvinces(data.provinces);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        try {
          const response = await fetch(`/api/address/districts?provinceId=${selectedProvince}`);
          const data = await response.json();
          if (data.success) {
            setDistricts(data.districts);
            setSubdistricts([]);
            setSelectedDistrict('');
            setSelectedSubdistrict('');
          }
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setSubdistricts([]);
      setSelectedDistrict('');
      setSelectedSubdistrict('');
    }
  }, [selectedProvince]);

  // Load subdistricts when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadSubdistricts = async () => {
        try {
          const response = await fetch(`/api/address/subdistricts?districtId=${selectedDistrict}`);
          const data = await response.json();
          if (data.success) {
            setSubdistricts(data.subdistricts);
            setSelectedSubdistrict('');
          }
        } catch (error) {
          console.error('Error loading subdistricts:', error);
        }
      };
      loadSubdistricts();
    } else {
      setSubdistricts([]);
      setSelectedSubdistrict('');
    }
  }, [selectedDistrict]);

  const loadMapCoordinates = async (company: any) => {
    try {
      const addressParts = [
        company.addressNumber,
        company.building,
        company.floor,
        company.soi,
        company.road,
        company.subdistrict?.nameTh,
        company.district?.nameTh,
        company.province?.nameTh,
        company.postalCode
      ].filter(Boolean);
      
      const fullAddress = addressParts.join(' ');
      
      if (fullAddress) {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(fullAddress)}`);
        const data = await response.json();
        
        if (data.success) {
          setMapCoordinates(data.coordinates);
        }
      }
    } catch (error) {
      console.error('Error loading map coordinates:', error);
    }
  };

  const updateAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      
      if (data.success && data.addressDetails) {
        // อัปเดตข้อมูลที่อยู่จากพิกัด
        const address = data.addressDetails;
        
        // อัปเดตข้อมูลบริษัท (ในกรณีนี้เป็นการแสดงผลเท่านั้น)
        // ในระบบจริงควรมี API สำหรับอัปเดตข้อมูลบริษัท
        console.log('Address from coordinates:', data.address);
        console.log('Address details:', address);
        
        // แสดงข้อความแจ้งเตือน
        toast({
          title: "อัปเดตตำแหน่งแผนที่",
          description: `ตำแหน่งใหม่: ${data.address}`,
        });
      }
    } catch (error) {
      console.error('Error updating address from coordinates:', error);
    }
  };

  const createNewEvaluation = async () => {
    try {
      // Get default evaluation form
      const formResponse = await fetch('/api/evaluation-forms?isActive=true');
      const formData = await formResponse.json();
      
      if (formData.success && formData.forms.length > 0) {
        const form = formData.forms[0];
        
        // Create evaluation with default questions
        const mockEvaluation: EvaluationData = {
          id: 'temp',
          studentId: 'current-user',
          companyId: companyId,
          status: 'pending',
          company: {
            id: companyId,
            name: 'Loading...',
            nameEn: 'Loading...'
          },
          evaluationForm: {
            ...form,
            questions: form.questions || []
          },
          answers: []
        };
        
        setEvaluation(mockEvaluation);
      }
    } catch (error) {
      console.error('Error creating new evaluation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลการประเมิน...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    notFound();
  }

  const handleScoreChange = (questionId: string, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }));
  };

  const handleAddressUpdate = async () => {
    try {
      if (!selectedProvince || !selectedDistrict || !selectedSubdistrict) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาเลือกจังหวัด อำเภอ และตำบล",
          variant: "destructive"
        });
        return;
      }

      // หาข้อมูลที่เลือก
      const province = provinces.find(p => p.id === selectedProvince);
      const district = districts.find(d => d.id === selectedDistrict);
      const subdistrict = subdistricts.find(s => s.id === selectedSubdistrict);

      if (!province || !district || !subdistrict) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่พบข้อมูลที่เลือก",
          variant: "destructive"
        });
        return;
      }

      // สร้างที่อยู่ใหม่
      const newAddress = `${evaluation?.company.addressNumber || ''} ${evaluation?.company.building || ''} ${evaluation?.company.floor || ''} ${evaluation?.company.soi || ''} ${evaluation?.company.road || ''} ${subdistrict.nameTh} ${district.nameTh} ${province.nameTh} ${subdistrict.postalCode || ''}`.trim();

      // อัปเดตข้อมูลบริษัทผ่าน API
      const updateResponse = await fetch(`/api/companies/${evaluation.companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provinceId: selectedProvince,
          districtId: selectedDistrict,
          subdistrictId: selectedSubdistrict,
          postalCode: subdistrict.postalCode
        })
      });

      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        // อัปเดตพิกัดแผนที่
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(newAddress)}`);
        const data = await response.json();
        
        if (data.success) {
          setMapCoordinates(data.coordinates);
          toast({
            title: "อัปเดตที่อยู่สำเร็จ",
            description: `ที่อยู่ใหม่: ${newAddress}`,
          });
        } else {
          toast({
            title: "อัปเดตที่อยู่สำเร็จ",
            description: "ไม่สามารถอัปเดตพิกัดแผนที่ได้",
          });
        }
      } else {
        throw new Error(updateData.error || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตที่อยู่ได้",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare answers for submission
      const answers = Object.entries(scores).map(([questionId, score]) => ({
        questionId,
        answerValue: score?.toString() || '0',
        answerText: undefined as string | undefined
      }));

      // Add comment as text answer if provided
      if (comment.trim()) {
        answers.push({
          questionId: 'comment',
          answerValue: 'text',
          answerText: comment.trim()
        });
      }

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: evaluation.studentId,
          companyId: evaluation.companyId,
          internshipId: evaluation.internshipId,
          evaluationFormId: evaluation.evaluationForm.id,
          answers
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
            title: "ส่งแบบประเมินสำเร็จ",
          description: `ขอบคุณสำหรับความคิดเห็นของคุณเกี่ยวกับ ${evaluation.company.name}`,
        });
        router.push('/student/evaluation');
      } else {
        throw new Error(data.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งแบบประเมินได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormComplete = Object.values(scores).every(score => score !== null && score > 0);


  const getFullAddress = () => {
    const addressParts = [
      evaluation.company.addressNumber,
      evaluation.company.building,
      evaluation.company.floor,
      evaluation.company.soi,
      evaluation.company.road,
      evaluation.company.subdistrict?.nameTh,
      evaluation.company.district?.nameTh,
      evaluation.company.province?.nameTh,
      evaluation.company.postalCode
    ].filter(Boolean);
    
    return addressParts.join(' ');
  };

  return (
    <div className="grid gap-8 text-secondary-600">
       <div>
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/student/evaluation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้ารายการ
            </Link>
        </Button>
        <h1 className="text-3xl font-bold gradient-text">แบบประเมินสถานประกอบการ</h1>
        <p>ประเมิน: <span className="font-semibold">{evaluation.company.name}</span></p>
      </div>

      {/* Company Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            ข้อมูลสถานประกอบการ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg">{evaluation.company.name}</h3>
              {evaluation.company.nameEn && (
                <p className="text-gray-600">{evaluation.company.nameEn}</p>
              )}
            </div>
            <div className="space-y-2">
              {evaluation.company.phone && (
                <p className="text-sm">
                  <span className="font-medium">โทรศัพท์:</span> {evaluation.company.phone}
                </p>
              )}
              {evaluation.company.email && (
                <p className="text-sm">
                  <span className="font-medium">อีเมล:</span> {evaluation.company.email}
                </p>
              )}
              {evaluation.company.website && (
                <p className="text-sm">
                  <span className="font-medium">เว็บไซต์:</span> 
                  <a 
                    href={evaluation.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {evaluation.company.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
            </div>
          </div>
          
          {getFullAddress() && (
            <div>
              <h4 className="font-medium mb-2">ที่อยู่:</h4>
              <p className="text-sm text-gray-700">{getFullAddress()}</p>
            </div>
          )}

          {/* Address Edit Form */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">แก้ไขที่อยู่:</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="province">จังหวัด</Label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.nameTh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="district">อำเภอ/เขต</Label>
                <Select 
                  value={selectedDistrict} 
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอำเภอ/เขต" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameTh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subdistrict">ตำบล/แขวง</Label>
                <Select 
                  value={selectedSubdistrict} 
                  onValueChange={setSelectedSubdistrict}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกตำบล/แขวง" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistricts.map((subdistrict) => (
                      <SelectItem key={subdistrict.id} value={subdistrict.id}>
                        {subdistrict.nameTh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                type="button"
                onClick={handleAddressUpdate}
                disabled={!selectedProvince || !selectedDistrict || !selectedSubdistrict}
                className="bg-blue-600 hover:bg-blue-700"
              >
                อัปเดตที่อยู่
              </Button>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-medium mb-2">แผนที่:</h4>
            <OpenStreetMap
              latitude={mapCoordinates?.lat || 13.7563}
              longitude={mapCoordinates?.lng || 100.5018}
              address={getFullAddress()}
              companyName={evaluation.company.name}
              height="300px"
              className="border rounded-lg"
              onLocationChange={(lat, lng) => {
                setMapCoordinates({ lat, lng });
                // อัปเดตข้อมูลที่อยู่เมื่อลากปักหมุด
                updateAddressFromCoordinates(lat, lng);
              }}
            />
            {mapCoordinates && (
              <p className="text-xs text-gray-500 mt-2">
                พิกัด: {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>หัวข้อการประเมิน</CardTitle>
            <CardDescription>
              โปรดให้คะแนนในแต่ละหัวข้อต่อไปนี้ (1 = น้อยที่สุด, 5 = มากที่สุด)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {evaluation.evaluationForm.questions?.map((q: any, index: number) => (
              <div key={q.id} className="space-y-3">
                <Label htmlFor={`q-${q.id}`} className="text-base">
                  {index + 1}. {q.question}
                </Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id={`q-${q.id}`}
                        min={1}
                        max={5}
                        step={1}
                        value={[scores[q.id] || 0]}
                        onValueChange={(value) => handleScoreChange(q.id, value[0])}
                        className="w-full max-w-sm"
                        disabled={isSubmitting}
                    />
                    <span className="font-bold text-lg w-8 text-center">{scores[q.id] || '-'}</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-gray-500">ไม่พบคำถามการประเมิน</p>
              </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="comment" className="text-base">
                    ข้อเสนอแนะเพิ่มเติม
                </Label>
                <Textarea
                    id="comment"
                    placeholder="คุณมีข้อเสนอแนะอะไรเพิ่มเติมเกี่ยวกับสถานประกอบการนี้หรือไม่?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

             <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isFormComplete}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและส่งแบบประเมิน'}
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
