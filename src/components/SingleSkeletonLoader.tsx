import { Skeleton } from "@/components/ui/skeleton";

const SingleTestimonySkeleton = () => {
  return (
    <main className="flex-1">
      <article className="py-12 md:py-16">
        <div className="container max-w-3xl">
          
          {/* Back Button & Category */}
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-4 w-40" /> {/* Back button */}
            <Skeleton className="h-6 w-24 rounded-full" /> {/* Badge */}
          </div>

          {/* Title */}
          <div className="mb-4 space-y-3">
            <Skeleton className="h-8 w-[90%]" />
            <Skeleton className="h-8 w-[70%]" />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Media Placeholder */}
          <Skeleton className="h-48 md:h-64 w-full rounded-lg mb-8" />

          {/* Full Story */}
          <div className="space-y-3 mb-12">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[95%]" />
            <Skeleton className="h-5 w-[90%]" />
            <Skeleton className="h-5 w-[85%]" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-[88%]" />
            <Skeleton className="h-5 w-[80%]" />
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <Skeleton className="h-4 w-40 mb-4" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-muted rounded-lg text-center space-y-4">
            <Skeleton className="h-6 w-[60%] mx-auto" />
            <Skeleton className="h-4 w-[70%] mx-auto" />
            <Skeleton className="h-10 w-48 mx-auto rounded-md" />
          </div>

        </div>
      </article>
    </main>
  );
};

export default SingleTestimonySkeleton;