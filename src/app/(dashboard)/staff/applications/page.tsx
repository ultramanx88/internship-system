'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, FileText, Calendar, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StaffDocumentPreview } from '@/components/staff/StaffDocumentPreview';
import { useAuth } from '@/hooks/use-auth';

interface Application {
    id: string;
    studentId: string;
    studentName: string;
    major: string;
    companyName: string;
    position: string;
    status: string;
    dateApplied: string;
    isPrinted: boolean;
    printRecord?: {
        id: string;
        documentNumber: string;
        documentDate: string;
        printedAt: string;
    };
    // Committee approval fields
    committeeApprovals?: Array<{
        committeeId: string;
        committeeName: string;
        approvedAt: string;
        status: 'approved' | 'rejected';
        reason?: string;
    }>;
    requiredApprovals: number;
    currentApprovals: number;
    pendingCommitteeReview: boolean;
    // ข้อมูลที่นักเรียนกรอกเข้ามา
    studentReason?: string;
    expectedSkills?: string[];
    projectProposal?: string;
    preferredStartDate?: string;
    availableDuration?: number;
    feedback?: string;
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadApplications();
    }, []);

    // Translate backend status to Thai labels used in UI
    const translateStatusToThai = (status: string): string => {
        const map: Record<string, string> = {
            pending: 'รอตรวจสอบ',
            approved: 'อนุมัติแล้ว',
            rejected: 'ปฏิเสธ',
            needs_changes: 'ต้องแก้ไข',
            completed: 'เสร็จสิ้น',
        };
        return map[status] || status;
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            // Fetch applications and print statuses from APIs
            const headers = user?.id ? { 'x-user-id': user.id } as HeadersInit : {};
            const [appsRes, printRes] = await Promise.all([
                fetch('/api/applications?limit=100&sort=desc', { headers }),
                fetch('/api/applications/print', { headers })
            ]);

            const appsJson = await appsRes.json();
            const printJson = await printRes.json().catch(() => ({ applications: [] }));

            // Build a map of print records keyed by application id
            const printMap = new Map<string, { id: string; documentNumber: string; documentDate: string; printedAt: string }>();
            if (printJson && Array.isArray(printJson.applications)) {
                for (const p of printJson.applications) {
                    if (p.printRecord) {
                        printMap.set(p.id, {
                            id: p.printRecord.id,
                            documentNumber: p.printRecord.documentNumber,
                            documentDate: p.printRecord.documentDate,
                            printedAt: p.printRecord.printedAt,
                        });
                    }
                }
            }

            const mapped: Application[] = (appsJson.applications || []).map((app: any) => {
                const studentId = app?.student?.id || app?.studentId || '';
                const studentName = app?.student?.name
                    || [app?.student?.t_name, app?.student?.t_surname].filter(Boolean).join(' ')
                    || [app?.student?.e_name, app?.student?.e_surname].filter(Boolean).join(' ')
                    || '-';
                const major = app?.student?.major?.nameTh || app?.student?.major?.nameEn || '-';
                const companyName = app?.internship?.company?.name || '-';
                const position = app?.internship?.position || app?.internship?.title || '-';
                const status = translateStatusToThai(app?.status);
                const dateApplied = typeof app?.dateApplied === 'string' ? app.dateApplied : new Date(app?.dateApplied).toISOString();

                const pr = printMap.get(app.id);

                return {
                    id: app.id,
                    studentId,
                    studentName,
                    major,
                    companyName,
                    position,
                    status,
                    dateApplied,
                    isPrinted: !!pr,
                    printRecord: pr ? {
                        id: pr.id,
                        documentNumber: pr.documentNumber,
                        documentDate: pr.documentDate,
                        printedAt: pr.printedAt,
                    } : undefined,
                    requiredApprovals: app.requiredApprovals ?? 2,
                    currentApprovals: app.currentApprovals ?? 0,
                    pendingCommitteeReview: app.pendingCommitteeReview ?? false,
                    committeeApprovals: app.committeeApprovals ?? [],
                    // ข้อมูลที่นักเรียนกรอกเข้ามา
                    studentReason: app.studentReason,
                    expectedSkills: app.expectedSkills,
                    projectProposal: app.projectProposal,
                    preferredStartDate: app.preferredStartDate,
                    availableDuration: app.availableDuration,
                    feedback: app.feedback,
                };
            });

            setApplications(mapped);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintDocument = async (applicationId: string) => {
        try {
            const response = await fetch('/api/applications/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.id ? { 'x-user-id': user.id } : {}),
                },
                body: JSON.stringify({
                    applicationIds: [applicationId],
                    documentNumber: `DOC-${Date.now()}`,
                    documentDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('พิมพ์เอกสารสำเร็จ');
                loadApplications(); // รีเฟรชข้อมูล
            } else {
                alert('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
            }
        } catch (error) {
            console.error('Error printing document:', error);
            alert('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
        }
    };

    const handleUpdateStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch('/api/applications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.id ? { 'x-user-id': user.id } : {}),
                },
                body: JSON.stringify({ id: applicationId, status }),
            });
            if (!response.ok) throw new Error('update failed');
            await loadApplications();
            alert(status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย');
        } catch (e) {
            alert('อัปเดตสถานะไม่สำเร็จ');
        }
    };

    const handleGoToPrintPage = () => {
        router.push('/admin/applications/print');
    };

    const handleGoToPreviewPage = () => {
        router.push('/admin/applications/print');
    };

    const handlePreviewDocument = (application: Application) => {
        const normalized: Application = {
            ...application,
            studentId: application.studentId || (application as any)?.student?.id || (application as any)?.userId || ''
        };
        setSelectedApplication(normalized);
        setIsPreviewOpen(true);
    };

    const handleViewDetails = (application: Application) => {
        router.push(`/staff/applications/${encodeURIComponent(application.id)}`);
    };

    // Remove legacy mockApplications list
    // const mockApplications = [ ... ];

    const getStatusBadge = (status: string, app: Application) => {
        // Check committee approval status
        if (app.pendingCommitteeReview) {
            if (app.currentApprovals >= app.requiredApprovals) {
                return <Badge className="bg-green-100 text-green-700">กรรมการอนุมัติแล้ว</Badge>;
            } else {
                return <Badge className="bg-orange-100 text-orange-700">
                    รอกรรมการ ({app.currentApprovals}/{app.requiredApprovals})
                </Badge>;
            }
        }

        switch (status) {
            case 'รอตรวจสอบ':
                return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
            case 'อนุมัติแล้ว':
                return <Badge className="bg-green-100 text-green-700">อนุมัติแล้ว</Badge>;
            case 'ต้องแก้ไข':
                return <Badge className="bg-red-100 text-red-700">ต้องแก้ไข</Badge>;
            case 'เสร็จสิ้น':
                return <Badge className="bg-blue-100 text-blue-700">เสร็จสิ้น</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getCommitteeStatus = (app: Application) => {
        if (!app.pendingCommitteeReview) return null;
        
        const approvedCount = app.currentApprovals;
        const requiredCount = app.requiredApprovals;
        const remaining = requiredCount - approvedCount;
        
        if (approvedCount >= requiredCount) {
            return (
                <div className="text-sm text-green-600">
                    ✓ กรรมการอนุมัติครบแล้ว ({approvedCount}/{requiredCount})
                </div>
            );
        } else {
            return (
                <div className="text-sm text-orange-600">
                    ⏳ รอกรรมการอีก {remaining} คน ({approvedCount}/{requiredCount})
                </div>
            );
        }
    };

    const filteredApplications = applications.filter(app =>
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.includes(searchTerm) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-700">เอกสารขอสหกิจศึกษา / ฝึกงาน</h1>
                        <p className="text-gray-600 mt-2">จัดการเอกสารขอฝึกงานและสหกิจศึกษา</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleGoToPrintPage}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            ไปยังหน้าพิมพ์เอกสาร
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออกรายงาน
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <FileText className="h-4 w-4 mr-2" />
                            สร้างเอกสารใหม่
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">รอตรวจสอบ</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {applications.filter(app => app.status === 'รอตรวจสอบ').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <FileText className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {applications.filter(app => app.status === 'อนุมัติแล้ว').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">ต้องแก้ไข</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {applications.filter(app => app.status === 'ต้องแก้ไข').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-red-100 rounded-full">
                                    <FileText className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {applications.filter(app => app.status === 'เสร็จสิ้น').length}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="ค้นหาด้วยชื่อนักศึกษา, รหัสนักศึกษา, บริษัท, หรือรหัสเอกสาร..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">
                                ตัวกรอง
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-amber-700">
                            รายการเอกสาร ({filteredApplications.length} รายการ)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">ไม่พบข้อมูลการสมัคร</p>
                            </div>
                        ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-amber-50">
                                        <TableHead className="font-semibold text-amber-700">รหัสเอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700">นักศึกษา</TableHead>
                                        <TableHead className="font-semibold text-amber-700">สถานประกอบการ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">ตำแหน่ง</TableHead>
                                        <TableHead className="font-semibold text-amber-700">วันที่ยื่น</TableHead>
                                        <TableHead className="font-semibold text-amber-700">สถานะ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">กรรมการ</TableHead>
                                        <TableHead className="font-semibold text-amber-700">เอกสาร</TableHead>
                                        <TableHead className="font-semibold text-amber-700 text-center">จัดการ</TableHead>
                                        <TableHead className="font-semibold text-amber-700 text-center">อนุมัติ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{app.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{app.studentName}</p>
                                                    <p className="text-sm text-gray-500">{app.studentId}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{app.companyName}</TableCell>
                                            <TableCell>{app.position || 'ไม่ระบุ'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {new Date(app.dateApplied).toLocaleDateString('th-TH')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(app.status, app)}
                                            </TableCell>
                                            <TableCell>
                                                {getCommitteeStatus(app)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        ใบสมัคร
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        ใบรับรอง
                                                    </Badge>
                                                    {app.isPrinted && (
                                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                                            พิมพ์แล้ว
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="sm" title="ดูรายละเอียด" onClick={() => handleViewDetails(app)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        title="พรีวิวเอกสาร"
                                                        onClick={() => handlePreviewDocument(app)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        title="พิมพ์เอกสาร"
                                                        onClick={() => handlePrintDocument(app.id)}
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(app.id, 'approved')}>อนุมัติ</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, 'rejected')}>ไม่อนุมัติ</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Staff Document Preview Modal */}
            {selectedApplication && (
                <StaffDocumentPreview
                    isOpen={isPreviewOpen}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setSelectedApplication(null);
                    }}
                    application={selectedApplication}
                    type="co_op" // Default to co_op, can be made dynamic based on application data
                    onApprove={async (id) => { await handleUpdateStatus(id, 'approved'); setIsPreviewOpen(false); }}
                    onReject={async (id) => { await handleUpdateStatus(id, 'rejected'); setIsPreviewOpen(false); }}
                />
            )}
        </div>
    );
}