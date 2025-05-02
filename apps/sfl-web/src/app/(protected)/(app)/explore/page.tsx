import { AppLayout } from "../../../components/layout/app-layout";
import { SnippetCard } from "../../../components/snippets/snippet-card";
import { CategoryFilter } from "../../../components/snippets/category-filter";
import { SearchBar } from "../../../components/snippets/search-bar";

// Mock data - would be fetched from API in a real app
const categories = [
  "All",
  "Science",
  "Technology",
  "History",
  "Arts",
  "Business",
  "Health",
];

const snippets = [
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
    is_public: true,
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
  {
    id: "4",
    title: "Understanding Blockchain Technology",
    description: "The fundamentals of blockchain explained simply",
    duration: 380, // in seconds
    tags: ["Technology", "Cryptocurrency", "Finance"],
    created_at: new Date("2023-12-01").toISOString(),
    is_public: true,
  },
  {
    id: "5",
    title: "Modern Art Movements",
    description: "A journey through the major movements in modern art",
    duration: 480, // in seconds
    tags: ["Arts", "Culture", "History"],
    created_at: new Date("2024-01-10").toISOString(),
    is_public: true,
  },
  {
    id: "6",
    title: "The Science of Sleep",
    description: "Understanding how sleep works and its importance for health",
    duration: 410, // in seconds
    tags: ["Health", "Science", "Wellness"],
    created_at: new Date("2024-02-05").toISOString(),
    is_public: true,
  },
];

export default function ExplorePage() {
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
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
} 