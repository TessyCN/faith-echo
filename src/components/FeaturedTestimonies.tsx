import { useGetCategories, useGetFeaturedTestimonies } from "@/services/testimonies.service";
import TestimonyCard from "./TestimonyCard";
import { FeaturedSkeleton } from "./overview/FeaturedSkeleton";



const FeaturedTestimonies = () => {
  const { data: testimonies, isLoading, error } = useGetFeaturedTestimonies();
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
            Featured Testimonies
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Be inspired by these powerful stories of faith from our community.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {isLoading &&  Array.from({ length: 3}).map((_, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
             <FeaturedSkeleton />
            </div>
           ))}
          {error && <div>Error fetching testimonies</div>}
          {testimonies?.map((testimony, index) => (
            <div
              key={testimony.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TestimonyCard testimony={testimony} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
 
};

export default FeaturedTestimonies;
