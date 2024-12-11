import { createClient } from '@supabase/supabase-js';
import { getAuth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import type { Database } from '@/types/database';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Create an authenticated client for API routes
export async function createAuthenticatedClient() {
  const headersList = headers();
  const authRequest = {
    headers: Object.fromEntries(headersList.entries()),
    method: 'GET',
    url: '/',
    cookies: {}
  };

  const { userId } = getAuth(authRequest);
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
} 