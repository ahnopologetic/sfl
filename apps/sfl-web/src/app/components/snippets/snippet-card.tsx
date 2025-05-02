"use client";
import Link from "next/link";
import { PlayCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface Snippet {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  tags: string[];
  created_at: string;
  is_public: boolean;
}

interface SnippetCardProps {
  snippet: Snippet;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  // Format duration to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{snippet.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {snippet.description}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(snippet.duration)}</span>
          </div>
          <span>•</span>
          <div>
            {new Date(snippet.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {snippet.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{snippet.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/snippet/${snippet.id}`} className="w-full">
          <Button className="w-full gap-2" variant="secondary">
            <PlayCircle className="h-4 w-4" />
            Play Snippet
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 