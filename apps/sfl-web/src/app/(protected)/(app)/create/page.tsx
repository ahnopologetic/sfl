import { AppLayout } from "../../../components/layout/app-layout";
import { CreateSnippetForm } from "../../../components/snippets/create-snippet-form";

export default function CreatePage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a New Snippet</h1>
          <p className="mt-2 text-muted-foreground">
            Describe what you want to learn about and we&apos;ll generate a personalized audio snippet
          </p>
        </div>
        <CreateSnippetForm />
      </div>
    </AppLayout>
  );
} 