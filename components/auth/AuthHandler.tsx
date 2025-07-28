'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthHandler() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Handle hash-based OAuth tokens (implicit flow)
    const handleAuthCallback = async () => {
      if (isProcessing) return; // Prevent multiple executions
      
      const hash = window.location.hash;
      console.log('AuthHandler: Checking for OAuth tokens in hash:', hash);
      
      if (!hash || !hash.includes('access_token')) {
        console.log('AuthHandler: No access token found in hash');
        return;
      }

      setIsProcessing(true);
      
      try {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('token_type');
        const expiresIn = hashParams.get('expires_in');
        
        console.log('AuthHandler: Found OAuth tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          expiresIn
        });
        
        if (accessToken) {
          console.log('AuthHandler: Setting Supabase session...');
          
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('AuthHandler: Session error:', error);
            router.push('/signin?error=auth_error');
            return;
          }

          if (data.session) {
            console.log('AuthHandler: Session set successfully, redirecting to dashboard');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            // Small delay to ensure session is properly set
            setTimeout(() => {
              router.push('/dashboard');
            }, 100);
          } else {
            console.error('AuthHandler: No session returned from setSession');
            router.push('/signin?error=no_session');
          }
        }
      } catch (error) {
        console.error('AuthHandler: Unexpected error:', error);
        router.push('/signin?error=auth_error');
      } finally {
        setIsProcessing(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        handleAuthCallback();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [router, isProcessing]);

  // Show a loading indicator if processing OAuth tokens
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">מעבד אימות...</p>
        </div>
      </div>
    );
  }

  return null;
}
