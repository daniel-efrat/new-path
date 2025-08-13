'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the next URL from the query parameters
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || '/dashboard';
        
        // Get the session (Supabase will automatically exchange the code for tokens)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          alert('שגיאה בהתחברות. אנא נסה שוב.');
          router.push('/signin');
          return;
        }

        if (session) {
          console.log('Successfully authenticated, redirecting to:', next);
          router.push(next);
        } else {
          console.error('No session after callback');
          router.push('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/signin');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        מתחבר...</div>
    </div>
  );
}
