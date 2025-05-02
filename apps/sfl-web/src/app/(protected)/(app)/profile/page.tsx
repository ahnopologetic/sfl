'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from "@/app/components/layout/app-layout";
import { Button } from '@/app/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Card>
          <CardHeader className="pb-3">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <UserIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4 text-center text-xl">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name || ''}
            </CardTitle>
            <CardDescription className="text-center">{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{new Date(user?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
} 