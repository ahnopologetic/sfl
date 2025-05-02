"use client";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

// Mock data for topics - would be fetched from API in a real app
const suggestedTopics = [
  "The history of quantum computing",
  "How electric cars work",
  "The basics of financial markets",
  "Space exploration milestones",
  "Machine learning fundamentals",
  "Climate change solutions",
];

export function CreateSnippetForm() {
  const [requestText, setRequestText] = useState("");
  const [tone, setTone] = useState("conversational");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call - would be replaced with actual API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 2000);
    
    // Comment for later implementation:
    // TODO: Connect to /snippets endpoint to create a job
  };

  const handleTopicSelect = (topic: string) => {
    setRequestText(topic);
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="request" className="text-lg font-medium">
              What would you like to learn about?
            </Label>
            <Textarea
              id="request"
              placeholder="Describe the topic or topics you're interested in learning about..."
              className="min-h-32"
              value={requestText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestText(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="pt-2">
              <p className="mb-2 text-sm font-medium">Suggested topics:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicSelect(topic)}
                    disabled={isLoading}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Choose a tone</Label>
            <RadioGroup
              defaultValue="conversational"
              value={tone}
              onValueChange={setTone}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              <div>
                <RadioGroupItem
                  value="professional"
                  id="professional"
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="professional"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-medium">Professional</span>
                  <span className="text-xs text-muted-foreground">
                    Clear, informative, academic style
                  </span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="conversational"
                  id="conversational"
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="conversational"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-medium">Conversational</span>
                  <span className="text-xs text-muted-foreground">
                    Casual, friendly, podcast-like
                  </span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="entertaining"
                  id="entertaining"
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="entertaining"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-medium">Entertaining</span>
                  <span className="text-xs text-muted-foreground">
                    Fun, engaging, with humor
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={isLoading || !requestText.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating snippet...
              </>
            ) : (
              <>
                Create Snippet
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {step === 2 && (
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold">Your snippet is being created!</h2>
            <p className="text-muted-foreground">
              We&apos;re working on generating your audio snippet about:
            </p>
            <p className="font-medium text-lg">{requestText}</p>
            <p className="text-sm text-muted-foreground">
              This process can take up to a minute. You&apos;ll receive a notification when it&apos;s ready.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setIsLoading(false);
              }}
            >
              Create another snippet
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 