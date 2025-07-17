import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 flex-1">
      <div className="flex-1 p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
      <div className="w-full md:w-[350px] flex-shrink-0">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
