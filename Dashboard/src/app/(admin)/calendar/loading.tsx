import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarLoading() {
    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <Card className="border-none shadow-lg overflow-hidden h-[700px]">
                <CardContent className="p-0 h-full flex flex-col">
                    {/* Calendar Header Simulation */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                        <div className="flex bg-gray-100 rounded-md p-1">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-16" />
                        </div>
                    </div>

                    {/* Calendar Grid Simulation */}
                    <div className="flex border-b">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <div key={day} className="flex-1 p-2 text-center border-l last:border-0">
                                <Skeleton className="h-4 w-12 mx-auto" />
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-5">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="border-l border-b border-gray-100 p-2 space-y-2">
                                <Skeleton className="h-4 w-6 ml-auto" />
                                {i % 5 === 0 && <Skeleton className="h-6 w-full rounded-sm" />}
                                {i % 8 === 0 && <Skeleton className="h-6 w-full rounded-sm bg-blue-100" />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
