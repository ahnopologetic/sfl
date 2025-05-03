"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  
  const handleCategoryChange = (category: string) => {
    // Use URLSearchParams to create query string with current parameters
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === 'All') {
      // Remove category parameter when selecting "All"
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Navigate to the new URL with updated params
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
} 