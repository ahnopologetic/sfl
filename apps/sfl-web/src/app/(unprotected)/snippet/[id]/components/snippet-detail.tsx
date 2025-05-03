'use client';

import { useEffect, useState } from "react";
import { snippetApi } from "@/lib/api";
import { AudioPlayer } from "@/app/components/player/audio-player";
import { SnippetMetadata } from "@/app/components/snippets/snippet-metadata";
import { Badge } from "@/app/components/ui/badge";

// Define our base snippet type
interface Snippet {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  tags: string[];
  created_at: string;
  is_public: boolean;
  spotify_track_id: string | null;
  spotify_artist: string | null;
  spotify_album: string | null;
  job_id: string;
  updated_at: string;
}

// The full snippet type that includes the audio_url needed by the SnippetMetadata component
interface CompleteSnippet extends Snippet {
  audio_url: string;
}

interface SnippetDetailProps {
  id: string;
}

export function SnippetDetail({ id }: SnippetDetailProps) {
  const [snippet, setSnippet] = useState<CompleteSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const data = await snippetApi.getSnippetMetadata(id);

        // Ensure the data matches our CompleteSnippet type
        const completeData: CompleteSnippet = {
          ...data,
          audio_url: data.audio_url,
          spotify_track_id: data.spotify_track_id || null,
          spotify_artist: data.spotify_artist || null,
          spotify_album: data.spotify_album || null
        };

        setSnippet(completeData);
      } catch (err) {
        console.error("Error fetching snippet:", err);
        setError("Failed to load snippet data");
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  if (loading) {
    return <p>Loading snippet details...</p>;
  }

  if (error || !snippet) {
    return <p className="text-red-500">{error || "Snippet not found"}</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Left column - Player */}
      <div className="md:col-span-2">
        <h1 className="mb-4 text-2xl font-bold md:text-3xl">{snippet.title}</h1>
        <div className="mb-6">
          <AudioPlayer audioUrl={snippet.audio_url} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About this snippet</h2>
          <p className="text-muted-foreground">{snippet.description}</p>

          <div className="flex flex-wrap gap-2">
            {snippet.tags && snippet.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Right column - Metadata */}
      <div>
        <SnippetMetadata snippet={snippet} />
      </div>
    </div>
  );
} 