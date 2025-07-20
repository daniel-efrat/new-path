export default function QuestionnaireLoading() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar skeleton */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-full w-1/3 bg-blue-500/50 rounded animate-pulse" />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Title skeletons */}
        <div className="space-y-8 mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        
        {/* Cards skeleton */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className="h-20 bg-gray-200 rounded animate-pulse"
              style={{ 
                animationDelay: `${i * 100}ms`,
                opacity: 1 - (i * 0.1)
              }}
            />
          ))}
        </div>

        {/* Anchor questions skeleton */}
        <div className="space-y-6 mt-12">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="space-y-4 bg-gray-100 p-4 rounded"
              style={{ 
                animationDelay: `${i * 150}ms`,
                opacity: 1 - (i * 0.15)
              }}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile hint skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t">
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  )
}
