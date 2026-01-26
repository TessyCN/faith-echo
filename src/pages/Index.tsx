import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedTestimonies from "@/components/FeaturedTestimonies";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturedTestimonies />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
