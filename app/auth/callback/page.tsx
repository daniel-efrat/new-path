'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/signin?error=auth_error');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard');
          // Redirect to dashboard on successful authentication
          router.push('/dashboard');
        } else {
          console.log('No session found, redirecting to signin');
          router.push('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/signin?error=auth_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">מעבד אימות...</p>
      </div>
    </div>
  );
}
