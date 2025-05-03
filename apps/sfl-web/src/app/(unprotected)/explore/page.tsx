import { AppLayout } from "../../components/layout/app-layout";
import { SnippetCard } from "../../components/snippets/snippet-card";
import { CategoryFilter } from "../../components/snippets/category-filter";
import { SearchBar } from "../../components/snippets/search-bar";
import { supabase } from "../../../lib/supabase";

// Define the Snippet interface based on the database schema
interface Snippet {
  id: string;
  user_id: string;
  job_id: string;
  title: string;
  description: string;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  is_public: boolean;
  spotify_track_id?: string;
  spotify_artist?: string;
  spotify_album?: string;
  created_at: string;
  updated_at: string;
}

// Function to fetch public snippets from Supabase
async function getPublicSnippets(params: {
  category?: string;
  search?: string;
}) {
  let query = supabase
    .from('snippets')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  // Apply category filter if not "All"
  if (params.category && params.category !== 'All') {
    query = query.contains('tags', [params.category]);
  }

  // Apply search filter if provided
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching snippets:', error);
    return [];
  }

  return data as Snippet[];
}

// Function to extract unique categories from snippets
function getUniqueCategories(snippets: Snippet[]) {
  const categoriesSet = new Set<string>();
  categoriesSet.add('All'); // Always include "All" category

  snippets.forEach(snippet => {
    if (snippet.tags && Array.isArray(snippet.tags)) {
      snippet.tags.forEach((tag: string) => categoriesSet.add(tag));
    }
  });

  return Array.from(categoriesSet);
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}) {
  // Get the parameters from URL
  const { category, search } = await searchParams;
  const selectedCategory = category || 'All';
  const searchQuery = search || '';

  // Fetch snippets with filters
  const snippets = await getPublicSnippets({
    category: selectedCategory,
    search: searchQuery,
  });

  // Extract unique categories from all snippets
  const categories = getUniqueCategories(snippets);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Explore Snippets</h1>
          <p className="mt-2 text-muted-foreground">
            Discover audio snippets on a variety of topics
          </p>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="mb-8">
          <CategoryFilter categories={categories} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.length > 0 ? (
            snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium">No snippets found</h3>
              <p className="mt-2 text-muted-foreground">
                Try changing your search filters or check back later
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 