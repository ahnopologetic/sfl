import Link from "next/link";
import { Headphones, ChevronRight, Music, Book, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { AppLayout } from "./components/layout/app-layout";

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 lg:py-32">
        <div className="container mx-auto flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Audio snippets for being fluent <br className="hidden sm:inline" />
            in <span className="text-primary">anything</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Generate personalized audio learning snippets on any topic using
            AI. Create, listen, and learn – anytime, anywhere.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/create">
              <Button size="lg" className="gap-2">
                Create Your First Snippet
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="gap-2">
                Explore Snippets
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-muted/50 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Snipfluent Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Turn any topic into a podcast-like learning experience in minutes
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">
                Personalized Generation
              </h3>
              <p className="mt-2 text-muted-foreground">
                Submit topics or themes and get custom audio snippets created
                just for you with multiple voices and engaging content.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Curated Playlists</h3>
              <p className="mt-2 text-muted-foreground">
                Create seamless playlists of your generated snippets to enjoy a
                continuous learning experience on any device.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">
                Curiosity-Driven Learning
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get personalized recommendations based on your interests, trending
                topics, and popular content from other users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="rounded-xl bg-primary/10 p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Ready to start learning?
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Create your first audio snippet in just a few clicks and start
                learning on the go.
              </p>
              <Link href="/signup" className="mt-8">
                <Button size="lg">Get Started for Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
