import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Music, Share2 } from "lucide-react";
import SocialShareButtons from "@/components/SocialShareButtons";
import { useState } from "react";
import { TestimonyCategory } from "@/types";
import { getCategoryStyle } from "./TestimonyCard";

interface TestimonyArchiveCardProps {
  id: string;
  title: string;
  snippet: string;
  contributor: string;
  category: TestimonyCategory;
  index: number;
  mediaType?: "image" | "video" | "audio";
}

// const categoryStyles: Record<TestimonyCategory, string> = {
//   Healing: "bg-healing/10 text-healing border-healing/20",
//   Provision: "bg-provision/10 text-provision border-provision/20",
//   Deliverance: "bg-deliverance/10 text-deliverance border-deliverance/20",
//   Breakthrough: "bg-breakthrough/10 text-breakthrough border-breakthrough/20",
// };

const mediaIcons = {
  image: Image,
  video: Video,
  audio: Music,
};

const TestimonyArchiveCard = ({
  id,
  title,
  snippet,
  contributor,
  category,
  mediaType,
  index
}: TestimonyArchiveCardProps) => {
  const [showShare, setShowShare] = useState(false);
  const MediaIcon = mediaType ? mediaIcons[mediaType] : null;

  return (
    <Card className="group h-full transition-shadow duration-300 shadow-card hover:shadow-card-hover border-border flex flex-col">
      {/* Media Thumbnail Area */}
      {mediaType && (
        <div className="relative h-32 bg-muted flex items-center justify-center rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          {MediaIcon && (
            <MediaIcon className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`w-fit text-xs font-medium ${getCategoryStyle([category])}`}
          >
            {category?.name}
          </Badge>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowShare(!showShare);
            }}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Share testimony"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <Link to={`/testimony/${id}`}>
          <h3 className="text-lg font-semibold text-card-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {snippet}
        </p>
      </CardContent>

      {showShare && (
        <div className="px-6 pb-3 animate-fade-in">
          <SocialShareButtons
            url={`${window.location.origin}/testimony/${id}`}
            title={title}
            description={snippet}
          />
        </div>
      )}

      <CardFooter className="pt-0 mt-auto">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-muted-foreground">— {contributor}</p>
          <Link
            to={`/testimony/${id}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Read more
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestimonyArchiveCard;
