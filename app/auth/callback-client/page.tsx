"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

const safeNextPath = (next: string | null) => {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard';
  }

  return next;
};

const getCallbackParam = (
  url: URL,
  hashParams: URLSearchParams,
  key: string
) => url.searchParams.get(key) ?? hashParams.get(key);

const getSafeAuthErrorMessage = (
  error: string,
  description?: string | null
) => {
  if (
    error === 'server_error' &&
    description?.includes('Unable to exchange external code')
  ) {
    return 'לא ניתן היה להשלים את ההתחברות מול Google. נסו להתחבר שוב.';
  }

  return description || 'OAuth callback failed';
};

export default function AuthCallbackClientPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('Completing sign-in...');
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    const redirectToSignin = (error: string, description?: string | null) => {
      const params = new URLSearchParams({ error });
      const safeDescription = getSafeAuthErrorMessage(error, description);

      if (safeDescription) {
        params.set('message', safeDescription);
      }

      router.replace(`/signin?${params.toString()}`);
    };

    const run = async () => {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(
          url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
        );
        const code = getCallbackParam(url, hashParams, 'code');
        const next = safeNextPath(getCallbackParam(url, hashParams, 'next'));
        const callbackError = getCallbackParam(url, hashParams, 'error');
        const callbackErrorCode = getCallbackParam(url, hashParams, 'error_code');
        const callbackErrorDescription = getCallbackParam(
          url,
          hashParams,
          'error_description'
        );
        const accessToken = getCallbackParam(url, hashParams, 'access_token');
        const refreshToken = getCallbackParam(url, hashParams, 'refresh_token');

        console.log('Client callback params:', {
          href: window.location.href,
          hasCode: !!code,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error: callbackError,
          errorCode: callbackErrorCode,
          next
        });

        if (callbackError || callbackErrorDescription) {
          const description = getSafeAuthErrorMessage(
            callbackError || 'oauth_callback_error',
            callbackErrorDescription || callbackError
          );

          console.error('OAuth callback returned an error:', {
            error: callbackError,
            errorCode: callbackErrorCode,
            description: callbackErrorDescription || callbackError,
          });
          setMessage(description);
          redirectToSignin(callbackError || 'oauth_callback_error', description);
          return;
        }

        // Some Supabase/Auth configurations return tokens in the URL hash.
        if (accessToken || refreshToken) {
          if (!accessToken || !refreshToken) {
            console.error('Incomplete OAuth token callback:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });
            setMessage('Authentication callback was incomplete.');
            redirectToSignin(
              'incomplete_oauth_callback',
              'The OAuth callback did not include both access and refresh tokens.'
            );
            return;
          }

          console.log('Attempting hash token session setup...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && data?.session) {
            setMessage('Signed in! Redirecting...');
            window.history.replaceState(null, '', url.pathname);
            router.replace(next);
            return;
          }

          console.error('Hash token session setup failed:', error);
          setMessage('Authentication failed. Redirecting to sign in...');
          redirectToSignin(
            error?.code || 'token_callback_error',
            error?.message || 'Could not create a session from the OAuth tokens.'
          );
          return;
        }

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

          console.error('PKCE exchange failed or no session:', error);
          setMessage('Authentication failed. Redirecting to sign in...');
          redirectToSignin(
            error?.code || 'pkce_exchange_error',
            error?.message || 'Could not exchange the OAuth code for a session.'
          );
          return;
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
        console.error('No session, OAuth error, code, or token callback found.');
        setMessage('Authentication failed. Redirecting to sign in...');
        redirectToSignin(
          'missing_oauth_callback',
          'No OAuth code or session was returned to the app.'
        );
      } catch (err) {
        console.error('Client callback error:', err);
        setMessage('Unexpected error. Redirecting to sign in...');
        redirectToSignin(
          'callback_error',
          err instanceof Error ? err.message : 'Unexpected callback error.'
        );
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
