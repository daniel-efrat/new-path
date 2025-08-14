'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PostAuth() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = localStorage.getItem('postLoginRedirect') || '/dashboard';
    localStorage.removeItem('postLoginRedirect'); // Clean up after use
    router.replace(redirectPath);
  }, [router]);

  return (
    <div>
      <p>Authenticating, please wait...</p>
    </div>
  );
}
