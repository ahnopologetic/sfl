'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from "@/app/components/layout/app-layout";
import { SnippetCard } from "@/app/components/snippets/snippet-card";
import { SearchBar } from "@/app/components/snippets/search-bar";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { snippetApi } from '@/lib/api';

export type Snippet = {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  tags: string[];
  created_at: string;
  is_public: boolean;
  spotify_track_id?: string;
  spotify_artist?: string;
  spotify_album?: string;
  job_id: string;
  updated_at: string;
};

export type Job = {
  id: string;
  user_id: string;
  request_text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  estimated_completion_time?: string;
  created_at: string;
  updated_at: string;
};

export default function MySnippetsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [pendingSnippets, setPendingSnippets] = useState<Job[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchSnippets = async () => {
      const snippets = await snippetApi.listSnippets();
      setMySnippets(snippets.items || []);
    };
    const fetchPendingSnippets = async () => {
      const pendingSnippets = await snippetApi.listJobs();
      setPendingSnippets(pendingSnippets || []);
    };
    fetchSnippets();
    fetchPendingSnippets();
  }, []);

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
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold">My Snippets</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome, {user?.user_metadata?.first_name || user?.email}! Manage your personal collection of learning snippets.
            </p>
          </div>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        <Tabs defaultValue="completed" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            {mySnippets.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mySnippets.map((snippet: Snippet) => (
                  <SnippetCard key={snippet.id} snippet={snippet} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <h3 className="text-lg font-medium">No snippets yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first audio snippet to get started
                </p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button>Create Snippet</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {pendingSnippets.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pendingSnippets.map((job: Job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border bg-card p-6 shadow-sm"
                  >
                    <h3 className="font-medium">{job.request_text}</h3>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Started {new Date(job.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <h3 className="text-lg font-medium">No jobs in progress</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Any snippets being generated will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 