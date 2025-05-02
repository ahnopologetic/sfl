import { AppLayout } from "../../../components/layout/app-layout";
import { AudioPlayer } from "../../../components/player/audio-player";
import { SnippetMetadata } from "../../../components/snippets/snippet-metadata";
import { Badge } from "../../../components/ui/badge";

// This would be fetched from the API in a real app
const getSnippetData = (id: string) => {
  // In a real app, we'd fetch this based on the ID
  // For now, we'll just return mock data 
  console.log(`Fetching snippet with ID: ${id}`);
  
  return {
    id,
    title: "The Science of Black Holes",
    description: "Learn about the formation and mysteries of black holes in an approachable way. This snippet explains the gravitational collapse, event horizons, and key theories around these fascinating cosmic phenomena.",
    audio_url: "/audio-placeholder.mp3", // This would be an actual audio URL in a real app
    duration_seconds: 312,
    tags: ["Science", "Physics", "Space", "Astronomy"],
    is_public: true,
    spotify_track_id: null,
    spotify_artist: null,
    spotify_album: null,
    created_at: new Date("2023-09-15").toISOString(),
    updated_at: new Date("2023-09-15").toISOString(),
  };
};

interface SnippetDetailPageProps {
  params: {
    id: string;
  };
}

export default function SnippetDetailPage({ params }: SnippetDetailPageProps) {
  // Get the snippet data based on the ID
  const snippet = getSnippetData(params.id);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
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
                {snippet.tags.map((tag) => (
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
      </div>
    </AppLayout>
  );
} 