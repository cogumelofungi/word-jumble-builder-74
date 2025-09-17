import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className={`
            relative px-4 py-2 rounded-full transition-all duration-300
            ${activeCategory === category.id 
              ? 'category-active' 
              : 'border-border/50 text-muted-foreground hover:border-accent/30 hover:text-foreground'
            }
          `}
        >
          <span className="font-medium">{category.name}</span>
          <Badge 
            variant="secondary" 
            className={`ml-2 text-xs ${
              activeCategory === category.id 
                ? 'bg-accent-foreground/20 text-accent-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {category.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
}