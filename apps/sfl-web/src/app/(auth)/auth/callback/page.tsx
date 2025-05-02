'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        try {
          // The supabase client will automatically handle the token exchange
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          // Successful authentication
          toast.success('Successfully signed in!');
          router.push('/dashboard');
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          toast.error('Failed to complete sign in process. Please try again.');
          router.push('/login');
        }
      } else {
        // If no code is provided, redirect to login
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
} 