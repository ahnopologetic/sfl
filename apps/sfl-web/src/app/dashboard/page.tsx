'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { supabase, signOut } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
      console.error('Error signing out:', error);
    } else {
      toast.success('Signed out successfully');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        
        <div className="mb-8">
          <p className="mb-2 text-lg">Welcome, {user?.user_metadata?.first_name || user?.email}!</p>
          <p className="text-muted-foreground">This is your Snipfluent dashboard. You can create and manage your audio snippets here.</p>
        </div>
        
        <div className="flex gap-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
} 