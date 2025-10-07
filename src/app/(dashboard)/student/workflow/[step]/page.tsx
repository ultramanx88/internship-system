'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function WorkflowStepPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const step = Number(params?.step ?? 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(step) || step < 1 || step > 5) {
      router.replace('/student/workflow/1');
    }
  }, [step, router]);

  const heading = useMemo(() => {
    const map: Record<number, { title: string; href: string; cta: string }> = {
      1: { title: 'ลงทะเบียนข้อมูลนักศึกษา', href: '/student/settings?from=workflow', cta: 'แก้ไขโปรไฟล์' },
      2: { title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน', href: '/student/application-form/internship-form', cta: 'กรอกแบบฟอร์ม' },
      3: { title: 'ยื่นเอกสารให้กับทางบริษัท', href: '/student/documents', cta: 'อัปโหลดเอกสาร' },
      4: { title: 'ช่วงสหกิจศึกษา / ฝึกงาน', href: '/student/internships', cta: 'ดูสถานะการฝึกงาน' },
      5: { title: 'กรอกหัวข้อโปรเจกต์', href: '/student/project-details', cta: 'กรอกหัวข้อ' },
    };
    return map[step] ?? map[1];
  }, [step]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-2">Step {step}: {heading.title}</h2>
      <p className="text-gray-600 mb-4">เลือกดำเนินการตามขั้นตอนนี้ได้ทันที หรือย้อนกลับเพื่อแก้ไขข้อมูล</p>

      <div className="flex items-center gap-3">
        <Link href={heading.href}>
          <Button className="bg-orange-600 hover:bg-orange-700" disabled={loading} onClick={() => setLoading(true)}>
            {heading.cta}
          </Button>
        </Link>
        <Button variant="outline" onClick={() => router.push(`/student/workflow/${Math.min(5, step + 1)}`)}>ขั้นตอนถัดไป</Button>
      </div>
    </div>
  );
}


