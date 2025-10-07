'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode, useMemo } from 'react';

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const step = Number(params?.step ?? 1);

  const progress = useMemo(() => Math.min(100, Math.max(0, Math.round((step - 1) / 4 * 100))), [step]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700">ขั้นตอนดำเนินการ</h1>
          <p className="text-gray-600">Workflow Step {step} / 5</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="px-3 py-1 rounded border text-sm">ย้อนกลับ</button>
          <Link href="/student/application-form" className="px-3 py-1 rounded bg-gray-800 text-white text-sm">ดูภาพรวม</Link>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded">
        <div className="h-2 bg-orange-500 rounded" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}


