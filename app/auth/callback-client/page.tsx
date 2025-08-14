"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallbackClientPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('Completing sign-in...');

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const next = url.searchParams.get('next') || '/dashboard';

        console.log('Client callback params:', {
          href: window.location.href,
          hasCode: !!code,
          next
        });

        // 1) Fast path: already have a session (e.g., implicit handled automatically)
        {
          const { data: s1 } = await supabase.auth.getSession();
          if (s1.session) {
            console.log('Existing session found, redirecting to next');
            setMessage('Signed in! Redirecting...');
            router.replace(next);
            return;
          }
        }

        // 2) PKCE flow: code present -> exchange
        if (code) {
          console.log('Attempting client PKCE exchange...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          console.log('Client exchange response:', { success: !error, hasSession: !!data?.session, error });

          if (!error && data?.session) {
            setMessage('Signed in! Redirecting...');
            router.replace(next);
            return;
          }

          console.warn('PKCE exchange failed or no session, falling back to session check');
        }

        // 3) Implicit or delayed session propagation: poll briefly for a session
        const started = Date.now();
        while (Date.now() - started < 3000) { // up to 3s
          const { data: s2 } = await supabase.auth.getSession();
          if (s2.session) {
            console.log('Session detected after wait, redirecting');
            setMessage('Signed in! Redirecting...');
            router.replace(next);
            return;
          }
          await new Promise(r => setTimeout(r, 200));
        }

        // 4) Give up and send back to signin with error
        console.error('No session and no code; redirecting back to signin');
        setMessage('Authentication failed. Redirecting to sign in...');
        router.replace('/signin?error=callback_error');
      } catch (err) {
        console.error('Client callback error:', err);
        setMessage('Unexpected error. Redirecting to sign in...');
        router.replace('/signin?error=callback_error');
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-svh flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
