import { AppLayout } from "@/app/components/layout/app-layout";
import { SnippetCard } from "@/app/components/snippets/snippet-card";
import { SearchBar } from "@/app/components/snippets/search-bar";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Plus } from "lucide-react";
import Link from "next/link";

// Mock data - would be fetched from API in a real app
const mySnippets = [
  {
    id: "1",
    title: "The Science of Black Holes",
    description: "Learn about the formation and mysteries of black holes",
    duration: 312, // in seconds
    tags: ["Science", "Physics", "Space"],
    created_at: new Date("2023-09-15").toISOString(),
    is_public: true,
  },
  {
    id: "2",
    title: "Introduction to Machine Learning",
    description: "A beginner-friendly overview of machine learning concepts",
    duration: 420, // in seconds
    tags: ["Technology", "AI", "Programming"],
    created_at: new Date("2023-10-05").toISOString(),
    is_public: false,
  },
  {
    id: "3",
    title: "The History of the Roman Empire",
    description: "Explore the rise and fall of one of history's greatest empires",
    duration: 550, // in seconds
    tags: ["History", "Ancient Civilizations"],
    created_at: new Date("2023-11-22").toISOString(),
    is_public: true,
  },
];

// Mock data for in-progress snippets
const pendingSnippets = [
  {
    id: "job-1",
    request_text: "Explain quantum computing for beginners",
    status: "processing",
    progress: 65,
    created_at: new Date("2024-03-15").toISOString(),
  },
];

export default function MySnippetsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Snippets</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your personal collection of learning snippets
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
                {mySnippets.map((snippet) => (
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
                {pendingSnippets.map((job) => (
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