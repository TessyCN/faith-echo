    import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
    import { Skeleton } from "@/components/ui/skeleton";

    const TestimonyArchiveCardSkeleton = () => {
    return (
        <Card className="h-full shadow-card border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Media Thumbnail Area */}
        <div className="relative h-32 bg-muted rounded-t-lg overflow-hidden">
            <Skeleton className="absolute inset-0 w-full h-full" />
        </div>

        <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
            {/* Category badge */}
            <Skeleton className="h-5 w-20 rounded-full" />

            {/* Share button */}
            <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Title */}
            <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[65%]" />
            </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
            <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[90%]" />
            <Skeleton className="h-3 w-[75%]" />
            </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto">
            <div className="flex items-center justify-between w-full">
            {/* Contributor */}
            <Skeleton className="h-3 w-24" />

            {/* Read more */}
            <Skeleton className="h-3 w-16" />
            </div>
        </CardFooter>
        </Card>
    );
    };


    export const SkeletonTestimonyLoader = () => {
    return Array.from({length: 6}).map((_, index) => {
        return <TestimonyArchiveCardSkeleton key={index} />
    });
};