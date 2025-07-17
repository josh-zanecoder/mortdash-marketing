import { Skeleton } from "@/components/ui/skeleton";

export default function TrackingSkeleton() {
  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-32 h-8" />
      </div>
      <div className="flex flex-wrap gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 min-w-[120px]">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-32 h-8" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i}><Skeleton className="h-6 w-24" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><Skeleton className="h-6 w-24" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
