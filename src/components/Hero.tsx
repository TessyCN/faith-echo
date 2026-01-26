import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 bg-[image:var(--hero-gradient)]">
      <div className="container text-center">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground mb-6 max-w-3xl mx-auto leading-tight animate-fade-in">
          Sharing God's goodness to inspire faith and hope.
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto animate-fade-in [animation-delay:100ms]">
          Read powerful stories of transformation, healing, and breakthrough from our community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:200ms]">
          <Button asChild size="lg" variant="hero">
            <Link to="/submit" className="gap-2">
              <Heart className="h-5 w-5" />
              Share Your Testimony
            </Link>
          </Button>
          <Button asChild size="lg" variant="heroOutline">
            <Link to="/testimonies" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Read Testimonies
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
