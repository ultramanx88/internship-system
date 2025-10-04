'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TeacherRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to educator dashboard
    router.replace('/educator');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">กำลังเปลี่ยนเส้นทางไปยังระบบใหม่...</p>
      </div>
    </div>
  );
}
