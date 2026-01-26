import TestimonyCard, { Testimony } from "./TestimonyCard";

const featuredTestimonies: Testimony[] = [
  {
    id: "1",
    title: "Healed After Years of Pain",
    snippet: "After suffering from chronic back pain for over a decade, I experienced complete healing during a prayer session. The doctors were amazed at my recovery, and I give all glory to God for this miracle.",
    contributor: "Sarah M.",
    category: "Healing",
  },
  {
    id: "2",
    title: "God Provided When All Seemed Lost",
    snippet: "When I lost my job and had no savings, I didn't know how I would feed my family. But God opened doors I never expected. Within two weeks, I received a job offer with better pay than before.",
    contributor: "Anonymous",
    category: "Provision",
  },
  {
    id: "3",
    title: "Breaking Free from Addiction",
    snippet: "I struggled with addiction for years, trying everything to break free. It was only when I surrendered to God that I found true freedom. Today marks 3 years of sobriety, and I've never felt more alive.",
    contributor: "Michael T.",
    category: "Deliverance",
  },
];

const FeaturedTestimonies = () => {
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
          {featuredTestimonies.map((testimony, index) => (
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
