"use client";

import React, { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { SendHorizontal } from "lucide-react";
import { Header } from "@/app/components/layout/header";
import { snippetApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import speech recognition with no SSR
const DictaphoneComponent = dynamic(
  () => import('@/app/components/dictaphone-controller'),
  { ssr: false }
);

export default function NewSnippetPage() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

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
    const job = await snippetApi.createJob(inputValue);
    if (job) {
      setInputValue("");
      router.push(`/my-snippets`);
    }
  };

  const handleTopicClick = (topic: string) => {
    setInputValue(topic);
  };

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center">
            What do you want to hear about?
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a topic, theme, or question..."
                className="pr-24 h-12"
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <DictaphoneComponent
                  onTranscriptChange={setInputValue}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim()}
                  className="h-10 w-10"
                  aria-label="Submit"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Try these interesting topics:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/90 transition-colors"
                    onClick={() => handleTopicClick(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 