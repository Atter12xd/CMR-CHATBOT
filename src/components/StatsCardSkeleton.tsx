/** Placeholder con el mismo layout que StatsCard mientras cargan datos. */
export default function StatsCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-app-line bg-white px-4 py-4 shadow-app-card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-app-field border border-app-line shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-2.5 w-28 max-w-full bg-app-field rounded-md" />
          <div className="h-8 w-24 max-w-full bg-app-field rounded-lg" />
        </div>
      </div>
    </div>
  );
}
