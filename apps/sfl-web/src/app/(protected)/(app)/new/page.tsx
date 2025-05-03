"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, SendHorizontal } from "lucide-react";
import { Header } from "@/app/components/layout/header";
import { profileApi, snippetApi, trendingTopicsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/app/components/ui/skeleton";
import Image from "next/image";
import CanvasConnector from "@/app/components/canvas-connector";
// Dynamically import speech recognition with no SSR
const DictaphoneComponent = dynamic(
  () => import('@/app/components/dictaphone-controller'),
  { ssr: false }
);

export default function NewSnippetPage() {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const router = useRouter();
  const [profile, setProfile] = useState<{
    username: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    timezone: string;
    canvas_api_key?: string;
    canvas_url?: string;
  } | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<{ title: string, description: string, image_url: string }[]>([]);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      setIsLoadingTopics(true);
      try {
        // Default values if location is not provided
        const region = "New York";
        const country = "US";
        const city = "New York";

        const trendingTopics = await trendingTopicsApi.retrieve(region, country, city);
        setTrendingTopics(trendingTopics.topics);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
        setTrendingTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    const fetchProfile = async () => {
      const profile = await profileApi.getCurrentProfile();
      setProfile(profile);
    };

    fetchTrendingTopics();
    fetchProfile();
  }, []);
  const suggestedTopics = [
    "Space Exploration",
    "Quantum Physics",
    "Climate Change",
    "History of Jazz",
    "Machine Learning",
    "Ancient Civilizations",
    "Neuroscience",
    "Philosophy of Mind",
    "Renewable Energy",
    "Modern Art"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const job = await snippetApi.createJob(inputValue);
      if (job) {
        setInputValue("");
        router.push(`/my-snippets`);
      }
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    setInputValue((prev) => prev ? `${prev},${topic}` : `I want to hear about ${topic}`);
  };

  // Skeleton loader for trending topics
  const TrendingTopicsSkeleton = () => (
    <div className="flex gap-4 animate-marquee whitespace-nowrap">
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-48">
          <div className="relative h-32 w-full rounded-md overflow-hidden">
            <Skeleton className="h-full w-full" />
            <div className="absolute bottom-0 left-0 p-2 z-20 w-full">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {
            !profile?.canvas_api_key && (
              <CanvasConnector />
            )
          }
          <h1 className="text-3xl font-bold text-center break-words">
            What do you want to hear about?
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a topic, theme, or question..."
                className="pr-24 h-12"
                disabled={isSubmitting}
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <DictaphoneComponent
                  onTranscriptChange={setInputValue}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isSubmitting}
                  className="h-10 w-10"
                  aria-label="Submit"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">
                Trending topics:
              </p>
              <div className="relative overflow-hidden w-full">
                {isLoadingTopics ? (
                  <TrendingTopicsSkeleton />
                ) : (
                  <div className="flex gap-4 animate-marquee whitespace-nowrap">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-48 cursor-pointer"
                        onClick={() => !isSubmitting && handleTopicClick(topic.title)}
                      >
                        <div className="relative h-32 w-full rounded-md overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                          <Image
                            src={`https://picsum.photos/200/300?random=${index}`}
                            alt={topic.title}
                            className="h-full w-full object-cover"
                            width={200}
                            height={300}
                          />
                          <div className="absolute bottom-0 left-0 p-2 z-20">
                            <h3 className="text-sm font-medium text-white">{topic.title}</h3>
                            <p className="text-xs text-white/80 line-clamp-2">{topic.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={`duplicate-${index}`}
                        className="flex-shrink-0 w-48 cursor-pointer"
                        onClick={() => !isSubmitting && handleTopicClick(topic.title)}
                      >
                        <div className="relative h-32 w-full rounded-md overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                          <Image
                            src={`https://picsum.photos/200/300?random=${index}`}
                            alt={topic.title}
                            className="h-full w-full object-cover"
                            width={200}
                            height={300}
                          />
                          <div className="absolute bottom-0 left-0 p-2 z-20">
                            <h3 className="text-sm font-medium text-white">{topic.title}</h3>
                            <p className="text-xs text-white/80 line-clamp-2">{topic.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">
                Try these interesting topics:
              </p>
              <div className="relative overflow-hidden w-full">
                <div className="flex gap-2 animate-marquee whitespace-nowrap">
                  {suggestedTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className={`cursor-pointer hover:bg-secondary/90 transition-colors ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => !isSubmitting && handleTopicClick(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                  {/* Duplicate the topics for a seamless loop */}
                  {suggestedTopics.map((topic) => (
                    <Badge
                      key={`${topic}-duplicate`}
                      variant="secondary"
                      className={`cursor-pointer hover:bg-secondary/90 transition-colors ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => !isSubmitting && handleTopicClick(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 