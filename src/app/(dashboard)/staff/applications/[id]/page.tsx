'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StaffGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, FileText, User, Building, Calendar, Printer, CheckCircle, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface CommitteeApproval {
    committeeId: string;
    committeeName: string;
    approvedAt: string;
    status: 'approved' | 'rejected' | 'pending';
    reason?: string;
}

interface ApplicationDetails {
    id: string;
    studentId?: string;
    studentName?: string;
    companyName?: string;
    position?: string;
    status?: string;
    dateApplied?: string;
    documents?: string[];
    printRecord?: {
        id: string;
        documentNumber?: string;
        documentDate?: string;
    };
    committeeApprovals?: CommitteeApproval[];
    requiredApprovals?: number;
    totalCommittees?: number;
    // Allow arbitrary shape for future expansion
    [key: string]: any;
}

export default function StaffApplicationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = decodeURIComponent(String(params?.id || ''));
    const [isLoading, setIsLoading] = useState(true);
    const [application, setApplication] = useState<ApplicationDetails | null>(null);
    const { user: currentUser } = useAuth();
    const [studentProfile, setStudentProfile] = useState<any | null>(null);
    const [isDocumentReviewed, setIsDocumentReviewed] = useState(false);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);

    // Mock data for committee approvals - ในระบบจริงจะดึงจาก API
    const mockCommitteeApprovals: CommitteeApproval[] = [
        {
            committeeId: 'committee_001',
            committeeName: 'กรรมการ 1',
            approvedAt: '2024-01-18',
            status: 'approved'
        },
        {
            committeeId: 'committee_002',
            committeeName: 'กรรมการ 2',
            approvedAt: '2024-01-19',
            status: 'rejected',
            reason: 'ข้อมูลบริษัทไม่ครบถ้วน'
        },
        {
            committeeId: 'committee_003',
            committeeName: 'กรรมการ 3',
            approvedAt: '',
            status: 'pending'
        },
        {
            committeeId: 'committee_004',
            committeeName: 'กรรมการ 4',
            approvedAt: '2024-01-20',
            status: 'approved'
        }
    ];

    const getCommitteeStatusSummary = (approvals: CommitteeApproval[]) => {
        const approved = approvals.filter(a => a.status === 'approved').length;
        const rejected = approvals.filter(a => a.status === 'rejected').length;
        const pending = approvals.filter(a => a.status === 'pending').length;
        const total = approvals.length;
        
        return { approved, rejected, pending, total };
    };

    const handleDocumentReview = () => {
        setIsDocumentReviewed(true);
        setShowDocumentPreview(true);
    };

    const handleClosePreview = () => {
        setShowDocumentPreview(false);
    };

    const handlePrintDocument = () => {
        // ฟังก์ชันสำหรับปริ้นเอกสาร
        window.print();
    };

    const handleDownloadDocument = () => {
        // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร
        alert('กำลังดาวน์โหลดเอกสาร...');
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!applicationId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Try a dedicated endpoint first if available
                let data: any = null;
                try {
                    const res = await fetch(`/api/applications/print?id=${encodeURIComponent(applicationId)}`);
                    if (res.ok) {
                        const json = await res.json();
                        // Accept either a single object or an array under applications and find by id
                        data = Array.isArray(json?.applications)
                            ? json.applications.find((a: any) => a.id === applicationId)
                            : (json?.application || null);
                    }
                } catch {}

                if (!data) {
                    // Fallback minimal object when API is not available
                    data = { id: applicationId };
                }

                if (mounted) setApplication(data);

                // Fetch student profile for the first tab if we have a studentId
                const studentId: string | undefined = data?.studentId || data?.student?.id || data?.userId;
                if (studentId && currentUser?.id) {
                    try {
                        const profileRes = await fetch(`/api/users/${encodeURIComponent(studentId)}` , {
                            headers: { 'x-user-id': currentUser.id }
                        });
                        if (profileRes.ok) {
                            const profileJson = await profileRes.json();
                            if (mounted) setStudentProfile(profileJson);
                        }
                    } catch {}
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [applicationId, currentUser?.id]);

    const InfoRow = ({ label, value }: { label: string; value?: string }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">{label}</span>
            <span className="text-gray-900 font-medium">{value || '-'}</span>
        </div>
    );

    return (
        <StaffGuard>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => router.push('/staff/applications')}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> กลับ
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-amber-700">รายละเอียดคำขอเอกสาร</h1>
                                <p className="text-gray-600">รหัสเอกสาร: {applicationId}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button className="bg-amber-600 hover:bg-amber-700">
                                <Printer className="h-4 w-4 mr-2" /> พิมพ์เอกสาร
                            </Button>
                        </div>
                    </div>

                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลสรุป</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="py-10 text-center text-gray-600">กำลังโหลด...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InfoRow label="ชื่อนักศึกษา" value={application?.studentName} />
                                        <InfoRow label="รหัสนักศึกษา" value={application?.studentId} />
                                        <InfoRow label="สถานะ" value={application?.status} />
                                    </div>
                                    <div>
                                        <InfoRow label="สถานประกอบการ" value={application?.companyName} />
                                        <InfoRow label="ตำแหน่ง" value={application?.position} />
                                        <InfoRow label="วันที่ยื่น" value={application?.dateApplied ? new Date(application?.dateApplied).toLocaleDateString('th-TH') : undefined} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                        <CardContent className="pt-6">
                            <Tabs defaultValue="student">
                                <TabsList className="flex flex-wrap">
                                    <TabsTrigger value="student" className="flex items-center gap-2"><User className="h-4 w-4" /> คำขอ</TabsTrigger>
                                    <TabsTrigger value="overview" className="flex items-center gap-2"><FileText className="h-4 w-4" /> สหกิจ ข้อมูล</TabsTrigger>
                                    <TabsTrigger value="company" className="flex items-center gap-2"><Building className="h-4 w-4" /> บริษัท</TabsTrigger>
                                    <TabsTrigger value="internship" className="flex items-center gap-2"><FileText className="h-4 w-4" /> สหกิจ</TabsTrigger>
                                    <TabsTrigger value="timeline" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> ไทม์ไลน์</TabsTrigger>
                                    <TabsTrigger value="documents" className="flex items-center gap-2"><FileText className="h-4 w-4" /> เอกสาร</TabsTrigger>
                                </TabsList>

                                <TabsContent value="student" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="text-amber-700 text-xl font-semibold">ข้อมูลส่วนตัว</div>
                                            <InfoRow label="ชื่อจริง-นามสกุล (Full-name)" value={studentProfile?.name || application?.studentName} />
                                            <InfoRow label="คณะ (Faculty)" value={studentProfile?.faculty?.nameTh || studentProfile?.faculty || '-'} />
                                            <InfoRow label="เบอร์โทร (Tel.)" value={studentProfile?.phone || '-'} />
                                            <InfoRow label="เกรดเฉลี่ย (GPAX)" value={studentProfile?.gpa || '-'} />
                                            <InfoRow label="ประเภทที่เลือก (Type)" value={application?.type || (application as any)?.internshipType || 'สหกิจศึกษา'} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-amber-700 text-xl font-semibold">ข้อมูลติดต่อ/การศึกษา</div>
                                            <InfoRow label="รหัสนักศึกษา (Student ID)" value={application?.studentId || studentProfile?.id} />
                                            <InfoRow label="สาขาวิชา (Major)" value={studentProfile?.major?.nameTh || studentProfile?.major || '-'} />
                                            <InfoRow label="อีเมล (Email)" value={studentProfile?.email || '-'} />
                                        </div>
                                    </div>

                                    <div className="my-6 h-px bg-gray-200" />

                                    <div className="text-amber-700 text-xl font-semibold mb-4">ข้อมูลสหกิจศึกษาหรือฝึกงาน</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <InfoRow label="ชื่อบริษัท (Company name)" value={application?.companyName || (application as any)?.internship?.company?.name} />
                                            <InfoRow label="แผนก (Department)" value={(application as any)?.department || (application as any)?.internship?.department || '-'} />
                                            <InfoRow label="ระยะเวลา (Duration)" value={(() => {
                                                const start = (application as any)?.preferredStartDate || (application as any)?.startDate;
                                                const end = (application as any)?.preferredEndDate || (application as any)?.endDate;
                                                if (start && end) return `${new Date(start).toLocaleDateString('th-TH')} – ${new Date(end).toLocaleDateString('th-TH')}`;
                                                return '-';
                                            })()} />
                                            <InfoRow label="ชื่อผู้ติดต่อ (Coordinator)" value={(application as any)?.coordinatorName || '-'} />
                                        </div>
                                        <div className="space-y-4">
                                            <InfoRow label="เลขทะเบียนพาณิชย์ (Registration no.)" value={(application as any)?.companyRegistrationNumber || (application as any)?.internship?.company?.registrationNumber || '-'} />
                                            <InfoRow label="ตำแหน่ง (Position)" value={application?.position || (application as any)?.internship?.title || '-'} />
                                            <InfoRow label="อาจารย์นิเทศก์ (Academic advisor)" value={(application as any)?.academicAdvisor || '-'} />
                                            <InfoRow label="เบอร์ผู้ติดต่อ (Coordinator tel.)" value={(application as any)?.coordinatorTel || '-'} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                        <div className="space-y-4">
                                            <InfoRow label="ชื่อหัวหน้า (Supervisor)" value={(application as any)?.supervisorName || '-'} />
                                        </div>
                                        <div className="space-y-4">
                                            <InfoRow label="เบอร์หัวหน้า (Supervisor tel.)" value={(application as any)?.supervisorTel || '-'} />
                                        </div>
                                    </div>

                                    <div className="my-6 h-px bg-gray-200" />

                                    <div className="text-amber-700 text-xl font-semibold mb-4">แผนที่ (Map)</div>
                                    {(() => {
                                        const lat: number | undefined = Number((application as any)?.companyLat || (application as any)?.latitude || (application as any)?.internship?.company?.latitude);
                                        const lon: number | undefined = Number((application as any)?.companyLon || (application as any)?.longitude || (application as any)?.internship?.company?.longitude);
                                        if (!isNaN(lat as any) && !isNaN(lon as any) && isFinite(lat as any) && isFinite(lon as any)) {
                                            const zoom = 15;
                                            const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.02}%2C${lat-0.02}%2C${lon+0.02}%2C${lat+0.02}&layer=mapnik&marker=${lat}%2C${lon}`;
                                            return (
                                                <div className="rounded-lg overflow-hidden border">
                                                    <iframe title="company-map" src={src} style={{ width: '100%', height: 360, border: 0 }} />
                                                </div>
                                            );
                                        }
                                        const address: string | undefined = (application as any)?.companyAddress || (application as any)?.internship?.company?.address;
                                        return <div className="text-gray-600">ยังไม่มีพิกัดสำหรับแผนที่{address ? ` (ที่อยู่: ${address})` : ''}</div>;
                                    })()}

                                    <div className="my-6 h-px bg-gray-200" />

                                    <div className="text-amber-700 text-xl font-semibold mb-4">ประวัติการรับรอง</div>
                                    {(() => {
                                        const approvals = (application as any)?.approvals || [];
                                        const findByRole = (roleKey: string) => approvals.find((a: any) => (a.role || a.approverRole) === roleKey) || {};
                                        const instructor = findByRole('courseInstructor');
                                        const committee = findByRole('committee');
                                        const display = (s: string | undefined) => {
                                            if (!s) return '-';
                                            const t = String(s).toLowerCase();
                                            if (t.includes('approve') || t === 'approved') return 'อนุมัติ';
                                            if (t.includes('reject') || t === 'rejected') return 'ไม่อนุมัติ';
                                            if (t.includes('pending')) return 'รอดำเนินการ';
                                            return s;
                                        };
                                        const reasonText = (r: any) => r?.reason || r?.note || '-';
                                        return (
                                            <div className="divide-y rounded-md border bg-white">
                                                <div className="flex items-center justify-between px-4 py-4">
                                                    <div className="text-gray-800 font-medium">อาจารย์ประจำวิชา</div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-gray-900 font-bold">{display(instructor.status)}</div>
                                                        <div className="text-amber-700">เหตุผล : <span className="text-gray-700">{reasonText(instructor)}</span></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-4">
                                                    <div className="text-gray-800 font-medium">คณะกรรมการ</div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-gray-900 font-bold">{display(committee.status)}</div>
                                                        <div className="text-amber-700">เหตุผล : <span className="text-gray-700">{reasonText(committee)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="my-6 h-px bg-gray-200" />

                                    {(() => {
                                        // Additional details text with dynamic term duration
                                        // Determine start/end from application or active semester dates
                                        const start = (application as any)?.preferredStartDate || (application as any)?.startDate || (application as any)?.semesterStartDate;
                                        const end = (application as any)?.preferredEndDate || (application as any)?.endDate || (application as any)?.semesterEndDate;
                                        const formatThai = (d: any) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                        const startText = formatThai(start);
                                        const endText = formatThai(end);
                                        const period = (startText && endText) ? `${startText} – ${endText}` : '-';
                                        const academicYear = (() => {
                                            const dt = start ? new Date(start) : new Date();
                                            return dt.getFullYear() + 543; // พ.ศ.
                                        })();
                                        const content = `ในการนี้ คณะได้พิจารณาแล้วเห็นว่าการเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน จะเกิดประโยชน์แก่นักศึกษาเป็นอย่างยิ่ง ดังนั้น คณะจึงขอความอนุเคราะห์ท่านรับนักศึกษาปฏิบัติงานสหกิจศึกษาในภาคการศึกษาที่ 2 ปีการศึกษา ${academicYear} ตั้งแต่วันที่ ${period} โดยคณะกำหนดให้นักศึกษาออกปฏิบัติงานสหกิจศึกษาในสถานประกอบการในฐานะพนักงานเต็มเวลา และระหว่างการปฏิบัติงานสหกิจศึกษานั้น นักศึกษาต้องจัดทำโครงงาน 1 เรื่อง เพื่อให้เป็นไปตามข้อกำหนดของหลักสูตร จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนักศึกษากลับมายังหลักสูตรการจัดการธุรกิจระหว่างประเทศ คณะบริหารธุรกิจและ ศิลปศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา`;
                                        return (
                                            <div>
                                                <div className="text-amber-700 text-xl font-semibold mb-4">รายละเอียดเพิ่มเติม</div>
                                                <div className="border rounded-lg p-5 bg-gray-50 text-gray-800 leading-8">
                                                    {content}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </TabsContent>

                                <TabsContent value="overview" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">นักศึกษา</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <InfoRow label="ชื่อ-นามสกุล" value={application?.studentName || studentProfile?.name} />
                                                <InfoRow label="รหัสนักศึกษา" value={application?.studentId || studentProfile?.id} />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">สถานประกอบการ</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <InfoRow label="ชื่อบริษัท" value={application?.companyName} />
                                                <InfoRow label="ตำแหน่ง" value={application?.position} />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="my-6 h-px bg-gray-200" />

                                    {(() => {
                                        const start = (application as any)?.preferredStartDate || (application as any)?.startDate || (application as any)?.semesterStartDate;
                                        const end = (application as any)?.preferredEndDate || (application as any)?.endDate || (application as any)?.semesterEndDate;
                                        const formatThai = (d: any) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                        const startText = formatThai(start);
                                        const endText = formatThai(end);
                                        const period = (startText && endText) ? `${startText} – ${endText}` : '-';
                                        const academicYear = (() => {
                                            const dt = start ? new Date(start) : new Date();
                                            return dt.getFullYear() + 543;
                                        })();
                                        const paragraph = `ในการนี้ คณะได้พิจารณาแล้วเห็นว่าการเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน จะเกิดประโยชน์แก่นักศึกษาเป็นอย่างยิ่ง ดังนั้น คณะจึงขอความอนุเคราะห์ท่านรับนักศึกษาปฏิบัติงานสหกิจศึกษาในภาคการศึกษาที่ 2 ปีการศึกษา ${academicYear} ตั้งแต่วันที่ ${period} โดยคณะกำหนดให้นักศึกษาออกปฏิบัติงานสหกิจศึกษาในสถานประกอบการในฐานะพนักงานเต็มเวลา และระหว่างการปฏิบัติงานสหกิจศึกษานั้น นักศึกษาต้องจัดทำโครงงาน 1 เรื่อง เพื่อให้เป็นไปตามข้อกำหนดของหลักสูตร จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนักศึกษากลับมายังหลักสูตรการจัดการธุรกิจระหว่างประเทศ คณะบริหารธุรกิจและ ศิลปศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา`;
                                        return (
                                            <div className="border rounded-lg p-5 bg-gray-50 text-gray-800 leading-8">
                                                {paragraph}
                                            </div>
                                        );
                                    })()}
                                </TabsContent>

                                <TabsContent value="company" className="mt-6">
                                    <div className="space-y-3">
                                        <InfoRow label="ชื่อบริษัท" value={application?.companyName} />
                                        <InfoRow label="ตำแหน่ง" value={application?.position} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="internship" className="mt-6">
                                    <div className="space-y-6">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-green-800 mb-2">ข้อมูลสหกิจศึกษา</h3>
                                            <p className="text-green-700">คำขอได้รับการอนุมัติจากกรรมการเรียบร้อยแล้ว</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">ข้อมูลการอนุมัติ</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">สถานะ:</span>
                                                        <span className="font-medium text-green-600">อนุมัติแล้ว</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">วันที่อนุมัติ:</span>
                                                        <span className="font-medium">20 มกราคม 2567</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">กรรมการที่อนุมัติ:</span>
                                                        <span className="font-medium text-green-600">
                                                            {getCommitteeStatusSummary(mockCommitteeApprovals).approved}/{getCommitteeStatusSummary(mockCommitteeApprovals).total} คน
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">สถานะการพิจารณา:</span>
                                                        <span className={`font-medium ${
                                                            getCommitteeStatusSummary(mockCommitteeApprovals).approved >= 2 
                                                                ? 'text-green-600' 
                                                                : 'text-yellow-600'
                                                        }`}>
                                                            {getCommitteeStatusSummary(mockCommitteeApprovals).approved >= 2 ? 'ผ่านเกณฑ์' : 'รอการอนุมัติเพิ่ม'}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">ข้อมูลการปฏิบัติงาน</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">วันที่เริ่ม:</span>
                                                        <span className="font-medium">1 มิถุนายน 2567</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">วันที่สิ้นสุด:</span>
                                                        <span className="font-medium">30 กันยายน 2567</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">ระยะเวลา:</span>
                                                        <span className="font-medium">4 เดือน</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">สถานะการพิจารณาของกรรมการ</CardTitle>
                                                <p className="text-sm text-gray-600">แสดงสถานะการอนุมัติของกรรมการแต่ละคน (ไม่ระบุชื่อจริง)</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {mockCommitteeApprovals.map((approval, index) => (
                                                        <div key={approval.committeeId} className={`flex items-center justify-between p-3 rounded-lg ${
                                                            approval.status === 'approved' ? 'bg-green-50' :
                                                            approval.status === 'rejected' ? 'bg-red-50' :
                                                            'bg-yellow-50'
                                                        }`}>
                                                            <div>
                                                                <p className="font-medium">{approval.committeeName}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {approval.approvedAt 
                                                                        ? new Date(approval.approvedAt).toLocaleDateString('th-TH')
                                                                        : 'รอการพิจารณา'
                                                                    }
                                                                </p>
                                                                {approval.reason && (
                                                                    <p className="text-xs text-red-600 mt-1">เหตุผล: {approval.reason}</p>
                                                                )}
                                                            </div>
                                                            <span className={`font-medium ${
                                                                approval.status === 'approved' ? 'text-green-600' :
                                                                approval.status === 'rejected' ? 'text-red-600' :
                                                                'text-yellow-600'
                                                            }`}>
                                                                {approval.status === 'approved' ? 'อนุมัติ' :
                                                                 approval.status === 'rejected' ? 'ไม่อนุมัติ' :
                                                                 'รอพิจารณา'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* สรุปผลการพิจารณา */}
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-medium text-gray-900 mb-2">สรุปผลการพิจารณา</h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                {getCommitteeStatusSummary(mockCommitteeApprovals).approved}
                                                            </div>
                                                            <div className="text-gray-600">อนุมัติ</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-red-600">
                                                                {getCommitteeStatusSummary(mockCommitteeApprovals).rejected}
                                                            </div>
                                                            <div className="text-gray-600">ไม่อนุมัติ</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-yellow-600">
                                                                {getCommitteeStatusSummary(mockCommitteeApprovals).pending}
                                                            </div>
                                                            <div className="text-gray-600">รอพิจารณา</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-center">
                                                        <span className="text-sm text-gray-600">
                                                            ต้องมีกรรมการอนุมัติอย่างน้อย <strong>2 คน</strong> จากทั้งหมด {getCommitteeStatusSummary(mockCommitteeApprovals).total} คน
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="flex gap-4">
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Printer className="w-4 h-4 mr-2" />
                                                พิมพ์เอกสารอนุมัติ
                                            </Button>
                                            <Button variant="outline">
                                                <FileText className="w-4 h-4 mr-2" />
                                                ดูรายละเอียดเพิ่มเติม
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline" className="mt-6">
                                    <div className="text-gray-600">จะเพิ่มไทม์ไลน์จากข้อมูลการยื่น/อนุมัติ/พิมพ์เอกสาร</div>
                                </TabsContent>

                                <TabsContent value="documents" className="mt-6">
                                    <div className="space-y-6">
                                        {/* สถานะการตรวจเอกสาร */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    สถานะการตรวจเอกสาร
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            isDocumentReviewed ? 'bg-green-500' : 'bg-yellow-500'
                                                        }`}></div>
                                                        <span className={`font-medium ${
                                                            isDocumentReviewed ? 'text-green-700' : 'text-yellow-700'
                                                        }`}>
                                                            {isDocumentReviewed ? 'ตรวจเอกสารแล้ว' : 'รอตรวจเอกสาร'}
                                                        </span>
                                                    </div>
                                                    <Button 
                                                        onClick={handleDocumentReview}
                                                        className={`${
                                                            isDocumentReviewed 
                                                                ? 'bg-green-600 hover:bg-green-700' 
                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                        }`}
                                                    >
                                                        {isDocumentReviewed ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                ตรวจเอกสารแล้ว
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                ตรวจเอกสาร
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* รายการเอกสาร */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>รายการเอกสาร</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {application?.documents?.length ? (
                                                    <div className="space-y-3">
                                                        {application.documents.map((doc: string, i: number) => (
                                                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-5 w-5 text-gray-500" />
                                                                    <span className="text-gray-900">{doc}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={() => setShowDocumentPreview(true)}
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        ดู
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={handleDownloadDocument}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-1" />
                                                                        ดาวน์โหลด
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600 text-center py-8">
                                                        ยังไม่มีรายการเอกสาร
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Document Preview Dialog */}
            <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            พรีวิวเอกสาร
                        </DialogTitle>
                        <DialogDescription>
                            ตรวจสอบเอกสารก่อนการอนุมัติและพิมพ์
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* ข้อมูลเอกสาร */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">ข้อมูลเอกสาร</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">เลขที่เอกสาร:</span>
                                    <span className="ml-2 font-medium">DOC-000001/2024</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">วันที่ออกเอกสาร:</span>
                                    <span className="ml-2 font-medium">{new Date().toLocaleDateString('th-TH')}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">ชื่อนักศึกษา:</span>
                                    <span className="ml-2 font-medium">{application?.studentName || studentProfile?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">สถานประกอบการ:</span>
                                    <span className="ml-2 font-medium">{application?.companyName}</span>
                                </div>
                            </div>
                        </div>

                        {/* เนื้อหาเอกสาร (Mock) */}
                        <div className="border rounded-lg p-6 bg-white">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">หนังสืออนุมัติการฝึกงาน</h2>
                                <p className="text-gray-600 mt-2">Letter of Approval for Internship</p>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed">
                                <p>
                                    เรื่อง <strong>อนุมัติการฝึกงานของนักศึกษา</strong>
                                </p>
                                
                                <p>
                                    เรียน <strong>ผู้จัดการฝ่ายทรัพยากรบุคคล</strong><br/>
                                    <strong>{application?.companyName}</strong>
                                </p>
                                
                                <p>
                                    ด้วยมหาวิทยาลัยได้พิจารณาคำขอฝึกงานของนักศึกษา <strong>{application?.studentName || studentProfile?.name}</strong> 
                                    รหัสนักศึกษา <strong>{application?.studentId || studentProfile?.id}</strong> 
                                    สาขาวิชา <strong>{studentProfile?.major?.nameTh || studentProfile?.major}</strong> 
                                    ในการฝึกงานที่บริษัท <strong>{application?.companyName}</strong> 
                                    ระหว่างวันที่ <strong>1 มิถุนายน 2567</strong> ถึง <strong>31 สิงหาคม 2567</strong>
                                </p>
                                
                                <p>
                                    ทางมหาวิทยาลัยขออนุมัติให้นักศึกษาดังกล่าวสามารถฝึกงานที่บริษัทของท่านได้ 
                                    และขอความร่วมมือในการดูแลและให้คำแนะนำแก่นักศึกษาในระหว่างการฝึกงาน
                                </p>
                                
                                <p>
                                    หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อได้ที่หมายเลขโทรศัพท์ 02-xxx-xxxx 
                                    หรืออีเมล internship@university.ac.th
                                </p>
                                
                                <div className="mt-8">
                                    <p className="text-center">
                                        ขอแสดงความนับถือ<br/>
                                        <strong>คณะกรรมการฝึกงาน</strong><br/>
                                        <strong>มหาวิทยาลัยเทคโนโลยี</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={handleClosePreview}>
                            ปิด
                        </Button>
                        <Button onClick={handlePrintDocument} className="bg-blue-600 hover:bg-blue-700">
                            <Printer className="h-4 w-4 mr-2" />
                            พิมพ์เอกสาร
                        </Button>
                        <Button onClick={handleDownloadDocument} className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            ดาวน์โหลด
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StaffGuard>
    );
}


