"use client";
import Link from "next/link";
import { Clock, Calendar, User, Globe, Share2, Edit } from "lucide-react";
import { Button } from "../ui/button";

interface Snippet {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  is_public: boolean;
  spotify_track_id: string | null;
  spotify_artist: string | null;
  spotify_album: string | null;
  created_at: string;
  updated_at: string;
}

interface SnippetMetadataProps {
  snippet: Snippet;
}

export function SnippetMetadata({ snippet }: SnippetMetadataProps) {
  // Format duration to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Snippet Details</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Duration: {formatDuration(snippet.duration_seconds)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Created:{" "}
            {new Date(snippet.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Created by: You
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Visibility: {snippet.is_public ? "Public" : "Private"}
          </span>
        </div>

        {snippet.spotify_track_id && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium">Original Spotify Track</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-muted"></div>
              <div>
                <div className="text-xs font-medium">{snippet.spotify_track_id}</div>
                <div className="text-xs text-muted-foreground">
                  {snippet.spotify_artist} • {snippet.spotify_album}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full gap-1">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Link href={`/snippet/${snippet.id}/edit`} className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-1">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 