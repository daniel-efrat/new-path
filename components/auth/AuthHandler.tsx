'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle hash-based OAuth tokens (implicit flow)
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');
      
      if (accessToken) {
        try {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Auth session error:', error);
            router.push('/signin?error=auth_error');
            return;
          }

          if (data.session) {
            console.log('Auth successful, redirecting to dashboard');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            // Redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Auth error:', error);
          router.push('/signin?error=auth_error');
        }
      }
    };

    // Only run on client side and if there's a hash
    if (typeof window !== 'undefined' && window.location.hash) {
      handleAuthCallback();
    }
  }, [router]);

  return null; // This component doesn't render anything
}
