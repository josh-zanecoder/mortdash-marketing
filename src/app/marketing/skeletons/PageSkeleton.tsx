import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col py-0 px-2">
      <div className="shadow-sm border rounded-xl flex flex-col flex-1 min-h-0 mt-8 mb-8 p-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="flex gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-40" />
          ))}
        </div>
        <Skeleton className="flex-1 w-full h-[500px] rounded-xl" />
      </div>
    </div>
  );
}
