export default function ProductCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="rounded-[22px] border border-app-line bg-white p-4 shadow-app-card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-[4.5rem] h-[4.5rem] rounded-xl bg-app-field shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-app-field rounded-md w-2/3 max-w-[200px]" />
            <div className="h-3 bg-app-field rounded w-24" />
          </div>
          <div className="h-6 w-20 bg-app-field rounded-lg shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-app-line bg-white overflow-hidden shadow-app-card animate-pulse">
      <div className="aspect-[4/3] bg-app-field" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-app-field rounded-md w-4/5" />
        <div className="h-3 bg-app-field rounded w-full" />
        <div className="h-3 bg-app-field rounded w-5/6" />
        <div className="flex justify-between pt-3 mt-2 border-t border-app-line">
          <div className="h-6 w-24 bg-app-field rounded-lg" />
          <div className="flex gap-1">
            <div className="w-9 h-9 rounded-xl bg-app-field" />
            <div className="w-9 h-9 rounded-xl bg-app-field" />
          </div>
        </div>
      </div>
    </div>
  );
}
