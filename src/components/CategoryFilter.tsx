import { TestimonyCategory } from "@/components/TestimonyCard";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: TestimonyCategory | "All";
  onCategoryChange: (category: TestimonyCategory | "All") => void;
}

const categories: (TestimonyCategory | "All")[] = [
  "All",
  "Healing",
  "Provision",
  "Deliverance",
  "Breakthrough",
];

const categoryColors: Record<TestimonyCategory | "All", string> = {
  All: "bg-primary text-primary-foreground hover:bg-primary/90",
  Healing: "bg-healing text-white hover:bg-healing/90",
  Provision: "bg-provision text-white hover:bg-provision/90",
  Deliverance: "bg-deliverance text-white hover:bg-deliverance/90",
  Breakthrough: "bg-breakthrough text-white hover:bg-breakthrough/90",
};

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={
            selectedCategory === category
              ? categoryColors[category]
              : "hover:bg-muted"
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
