'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { StudentGuard } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TimelineStep = 1 | 2 | 3 | 4 | 5;

export default function ApplicationFormPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profileOk, setProfileOk] = useState(false);
    const [latestApp, setLatestApp] = useState<any | null>(null);

    const lang = useMemo(() => {
        return (navigator.language || 'th').toLowerCase().startsWith('en') ? 'en' : 'th';
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                // 1) ตรวจโปรไฟล์
                const prof = await fetch('/api/user/profile', { headers: { 'x-user-id': user?.id || '' } });
                if (prof.ok) {
                    const data = await prof.json();
                    const p = data?.profile || data;
                    const ok = !!(p?.name && p?.email && p?.phone && p?.facultyId && p?.majorId);
                    setProfileOk(ok);
                }
                // 2) ดึงใบสมัครล่าสุดของนักศึกษา
                const apps = await fetch('/api/student/applications?limit=1', { headers: { 'x-user-id': user?.id || '' } });
                if (apps.ok) {
                    const data = await apps.json();
                    const a = data?.data?.applications?.[0] || null;
                    setLatestApp(a);
                }
            } catch (e) {
                // noop
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) load();
    }, [user?.id]);

    const step1Done = profileOk;
    const step2Done = !!(latestApp && (latestApp.projectTopic || latestApp.feedback));
    const step3Done = !!latestApp; // ยื่นแล้วถือว่าส่งเอกสารแล้วในเฟสแรก
    const step4Active = latestApp?.status === 'approved' || latestApp?.status === 'co_op' || latestApp?.status === 'in_progress';
    const step5Done = !!latestApp?.projectTopic;

    const Row = ({ index, title, done, action, locked, note }: { index: number; title: string; done?: boolean; action?: React.ReactNode; locked?: boolean; note?: string }) => (
        <div className={`flex items-center justify-between rounded-xl px-4 py-5 mb-4 ${locked ? 'bg-gray-100' : 'bg-white'} border` }>
            <div className="flex items-center gap-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${done ? 'bg-emerald-600' : 'bg-amber-600'}`}>{done ? <Check className="h-4 w-4"/> : index}</div>
                <div>
                    <div className="text-lg font-medium">{title}</div>
                    {note && <div className="text-sm text-muted-foreground mt-1">{note}</div>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {action}
            </div>
        </div>
    );

    return (
        <StudentGuard>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">ยื่นขอสหกิจศึกษา</h1>
                    {loading ? (
                        <div className="p-6 bg-white rounded-xl border">กำลังโหลด...</div>
                    ) : (
                        <div>
                            <Row
                                index={1}
                                title={'ลงทะเบียนข้อมูลนักศึกษา'}
                                done={step1Done}
                                action={
                                    <Link href="/student/settings">
                                        <Button variant="outline">ดำเนินการ</Button>
                                    </Link>
                                }
                            />

                            <Row
                                index={2}
                                title={'กรอกรายละเอียดสหกิจหรือฝึกงาน'}
                                done={step2Done}
                                locked={!step1Done}
                                action={
                                    <Link href="/student/application-form/internship-form">
                                        <Button disabled={!step1Done}>ดำเนินการ</Button>
                                    </Link>
                                }
                                note={!step1Done ? 'กรุณากรอกโปรไฟล์ให้ครบก่อน' : undefined}
                            />

                            <Row
                                index={3}
                                title={'ยื่นเอกสารให้กับทางบริษัท'}
                                done={step3Done}
                                locked={!step2Done}
                                action={
                                    <Link href="/student/documents">
                                        <Button variant="outline" disabled={!step2Done}>ธุรการแจ้งรับเอกสาร</Button>
                                    </Link>
                                }
                            />

                            <Row
                                index={4}
                                title={'ช่วงสหกิจศึกษา / ฝึกงาน'}
                                done={step4Active}
                                locked={!step3Done}
                                note={step4Active ? 'นศ.อยู่ระหว่างการสหกิจศึกษา / ฝึกงาน' : undefined}
                                action={<Button variant="outline" disabled>ติดตาม</Button>}
                            />

                            <Row
                                index={5}
                                title={'กรอกหัวข้อโปรเจกต์'}
                                done={step5Done}
                                locked={!step4Active}
                                action={
                                    <Link href="/student/project-details">
                                        <Button disabled={!step4Active}>ดำเนินการ</Button>
                                    </Link>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </StudentGuard>
    );
}