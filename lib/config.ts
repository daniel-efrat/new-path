const SITE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://new-path-test.vercel.app'
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const config = {
  siteUrl: SITE_URL,
  supabase: {
    url: SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  auth: {
    callbackPath: '/auth/callback',
  },
};

export default config;
