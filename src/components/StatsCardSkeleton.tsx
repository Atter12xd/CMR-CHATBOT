/** Placeholder con el mismo layout que StatsCard mientras cargan datos. */
export default function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-app-line bg-gradient-to-br from-white/[0.05] to-transparent px-4 py-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-app-line shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-2.5 w-28 max-w-full bg-white/[0.08] rounded-md" />
          <div className="h-8 w-24 max-w-full bg-white/[0.1] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
