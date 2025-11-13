export default function QuestionnaireLoading() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar skeleton */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded">
            <div className="h-full w-1/3 bg-primary/50 rounded animate-pulse" />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Title skeletons */}
        <div className="space-y-8 mb-12">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-muted rounded animate-pulse"
              style={{
                animationDelay: `${i * 100}ms`,
                opacity: 1 - i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Anchor questions skeleton */}
        <div className="space-y-6 mt-12">
          <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 bg-muted/30 p-4 rounded"
              style={{
                animationDelay: `${i * 150}ms`,
                opacity: 1 - i * 0.15,
              }}
            >
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile hint skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border/60">
        <div className="h-4 bg-muted rounded w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
