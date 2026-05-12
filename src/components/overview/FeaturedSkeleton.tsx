import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

// TestimonyCardSkeleton.jsx or inline in your component
export const FeaturedSkeleton= () => {
  return (
      <Card className="group h-full border-border cursor-wait">
        <CardHeader className="pb-3">
          {/* Badge skeleton */}
          <div className="w-fit">
            <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
          </div>
          {/* Title skeleton */}
          <div className="mt-2 space-y-2">
            <div className="h-5 bg-muted rounded-md animate-pulse w-3/4" />
            <div className="h-5 bg-muted rounded-md animate-pulse w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-2">
          {/* Snippet lines */}
          <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-11/12" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-2/3" />
        </CardContent>
        <CardFooter className="pt-0">
          {/* Contributor skeleton */}
          <div className="h-3 bg-muted rounded-md animate-pulse w-24" />
        </CardFooter>
      </Card>
  );
};