export default function ProductCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="rounded-2xl border border-app-line bg-app-card p-4 shadow-app-card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/[0.08] shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-white/[0.1] rounded-md w-2/3 max-w-[200px]" />
            <div className="h-3 bg-white/[0.06] rounded w-24" />
          </div>
          <div className="h-6 w-20 bg-white/[0.1] rounded-lg shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-app-line bg-app-card overflow-hidden shadow-app-card animate-pulse">
      <div className="h-44 bg-white/[0.06]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/[0.1] rounded-md w-4/5" />
        <div className="h-3 bg-white/[0.06] rounded w-full" />
        <div className="h-3 bg-white/[0.06] rounded w-5/6" />
        <div className="flex justify-between pt-3 mt-2 border-t border-app-line">
          <div className="h-6 w-24 bg-white/[0.1] rounded-lg" />
          <div className="flex gap-1">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
            <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}
