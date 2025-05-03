import { AppLayout } from "@/app/components/layout/app-layout";
import { SnippetDetail } from "./components/snippet-detail";
import { Suspense } from "react";

// Define the server component to handle the route
export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<p>Loading snippet...</p>}>
          <SnippetDetail id={id} />
        </Suspense>
      </div>
    </AppLayout>
  );
}