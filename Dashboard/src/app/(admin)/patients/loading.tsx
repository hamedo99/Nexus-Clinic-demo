import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PatientsLoading() {
    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-full max-w-sm rounded-md" />
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="bg-gray-50/50 pb-4">
                    <div className="grid grid-cols-5 gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center">
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center gap-3 col-span-1">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
