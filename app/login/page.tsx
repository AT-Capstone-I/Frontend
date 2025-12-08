'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /login 경로를 /signup으로 리다이렉트
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signup');
  }, [router]);

  return null;
}





