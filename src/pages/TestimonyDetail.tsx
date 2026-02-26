import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Image, Video, Music, Calendar, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SocialShareButtons from "@/components/SocialShareButtons";
import { testimoniesData } from "@/data/testimonies";
import { TestimonyCategory } from "@/components/TestimonyCard";
import { format } from "date-fns";

const categoryStyles: Record<TestimonyCategory, string> = {
  Healing: "bg-healing/10 text-healing border-healing/20",
  Provision: "bg-provision/10 text-provision border-provision/20",
  Deliverance: "bg-deliverance/10 text-deliverance border-deliverance/20",
  Breakthrough: "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
};

const mediaIcons = {
  image: Image,
  video: Video,
  audio: Music,
};

const TestimonyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const testimony = testimoniesData.find((t) => t.id === id);

  if (!testimony) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Testimony Not Found
            </h1>
            <Link to="/testimonies">
              <Button>Back to Testimonies</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const MediaIcon = testimony.mediaType ? mediaIcons[testimony.mediaType] : null;
  const shareUrl = `${window.location.origin}/testimony/${testimony.id}`;

  return (
    <>
      <Helmet>
        <title>{testimony.title} | Grace Testimonies</title>
        <meta name="description" content={testimony.snippet} />
        <meta property="og:title" content={testimony.title} />
        <meta property="og:description" content={testimony.snippet} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={testimony.title} />
        <meta name="twitter:description" content={testimony.snippet} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          <article className="py-12 md:py-16">
            <div className="container max-w-3xl">
              {/* Back Button & Category */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/testimonies"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Testimonies</span>
                </Link>

                <Badge
                  variant="outline"
                  className={categoryStyles[testimony.category]}
                >
                  {testimony.category}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {testimony.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <span>— {testimony.contributor}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(testimony.createdAt, "MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {testimony.views} views
                </span>
              </div>

              {/* Media Placeholder */}
              {testimony.mediaType && MediaIcon && (
                <div className="relative h-48 md:h-64 bg-muted flex items-center justify-center rounded-lg overflow-hidden mb-8">
                  <div className="absolute inset-0 bg-primary/5" />
                  <MediaIcon className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}

              {/* Full Story */}
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {testimony.fullStory}
                </p>
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Share this testimony
                </h3>
                <SocialShareButtons
                  url={shareUrl}
                  title={testimony.title}
                  description={testimony.snippet}
                />
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 bg-muted rounded-lg text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Has God done something amazing in your life?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your story can inspire faith and hope in others.
                </p>
                <Link to="/submit">
                  <Button size="lg" variant="hero">
                    Share Your Testimony
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TestimonyDetail;
