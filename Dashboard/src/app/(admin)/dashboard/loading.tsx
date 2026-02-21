import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 p-1" dir="rtl">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-none shadow-sm h-32">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Calendar Skeleton */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-300" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Card className="h-[600px] border-none shadow-lg overflow-hidden">
                        <Skeleton className="h-full w-full" />
                    </Card>
                </div>

                {/* Appointment List Skeleton */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-300" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Card className="h-[665px] border-none shadow-lg overflow-hidden p-4 space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
}
