'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!code) {
        toast.error('No code provided');
        router.push('/login');
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }

        // Successful authentication
        toast.success('Successfully signed in!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Error signing in:', error);
        toast.error('Error signing in');
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [code, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
} 