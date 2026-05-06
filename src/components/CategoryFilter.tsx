
import { Button } from "@/components/ui/button";
import { TestimonyCategory } from "@/types";

interface CategoryProps {
category: TestimonyCategory [];
filterByCategory: (category: TestimonyCategory) => void;
selectedCategory: string;
}


const CategoryFilter = ({filterByCategory, category, selectedCategory}: CategoryProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {category && category?.map((category) => (
        <Button
          key={category.id}
          // variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCategory(category)}
          className={
            `${selectedCategory ===  category.slug ? "bg-primary/90 text-primary-foreground hover:bg-primary/90" : "bg-white text-primary border border-primary hover:bg-secondary/90"}`
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
