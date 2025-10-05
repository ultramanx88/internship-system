'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyEducatorSettingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/educator/settings');
  }, [router]);
  return null;
}


