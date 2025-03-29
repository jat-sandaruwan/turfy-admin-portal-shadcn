import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading component for dashboard content
 * Shows a nice skeleton layout while the actual content is loading
 */
export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-[250px]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-[180px] rounded-lg" />
                    <Skeleton className="h-[180px] rounded-lg" />
                    <Skeleton className="h-[180px] rounded-lg" />
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-[250px] rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-[250px] rounded-lg" />
                </div>
            </div>
        </div>
    );
}