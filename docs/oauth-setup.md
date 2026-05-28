# Google OAuth setup

This app uses Supabase Auth as the OAuth broker:

1. The app calls `supabase.auth.signInWithOAuth({ provider: "google" })`.
2. Supabase redirects the user to Google.
3. Google redirects back to Supabase at `/auth/v1/callback`.
4. Supabase redirects back to this app at `/auth/callback-client`.

## Current project values

Use these values for the current hosted project:

```txt
App URL (local): http://localhost:3000
App URL (production): https://new-path-test.vercel.app
Supabase URL: https://hhcjagfhomddigmlbefj.supabase.co
Supabase Google callback URL: https://hhcjagfhomddigmlbefj.supabase.co/auth/v1/callback
Google web client ID: 297393331345-k6dct5en4j8o6mmgvle25j4l6c7v67ds.apps.googleusercontent.com
```

## Google Cloud

Go to Google Cloud Console -> Google Auth Platform -> Clients -> Web client.

Authorized JavaScript origins:

```txt
http://localhost:3000
https://new-path-test.vercel.app
```

Authorized redirect URIs:

```txt
https://hhcjagfhomddigmlbefj.supabase.co/auth/v1/callback
```

Only add a self-hosted Supabase callback such as `https://supabase.example.com/auth/v1/callback` if `NEXT_PUBLIC_SUPABASE_URL` points at that self-hosted instance.

Do not use the Vercel app URL as the Google redirect URI for Supabase Auth. Google redirects to Supabase first; Supabase redirects to the app after the provider callback succeeds.

## Supabase Google provider

Go to Supabase Dashboard -> Authentication -> Sign In / Providers -> Google.

Set:

```txt
Enable Sign in with Google: on
Client IDs: 297393331345-k6dct5en4j8o6mmgvle25j4l6c7v67ds.apps.googleusercontent.com
Client Secret: the secret from the same Google web OAuth client
Skip nonce checks: off
Allow users without an email: off
```

Important: the `Client IDs` field must contain the Google OAuth client ID ending in `.apps.googleusercontent.com`. It must not contain `new-path-test.vercel.app`. Using the app domain there causes Google's `401 invalid_client` error.

If the app receives:

```txt
server_error / unexpected_failure / Unable to exchange external code
```

Google accepted the user sign-in and sent a code back to Supabase, but Supabase failed to exchange that code with Google. Re-copy the client ID and client secret from the same Google Cloud web OAuth client into the Supabase Google provider settings, then confirm Google Cloud has the exact Supabase callback URL listed under Authorized redirect URIs.

## Supabase URL configuration

Go to Supabase Dashboard -> Authentication -> URL Configuration.

Recommended Site URL:

```txt
https://new-path-test.vercel.app
```

Add these redirect URLs:

```txt
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback-client
https://new-path-test.vercel.app/auth/callback
https://new-path-test.vercel.app/auth/callback-client
```

For Vercel preview deployments, add a wildcard redirect for the preview host pattern if needed.

## Vercel environment

Set these Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hhcjagfhomddigmlbefj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://new-path-test.vercel.app
```

After changing provider or URL settings, restart local dev with:

```bash
npm run dev
```
