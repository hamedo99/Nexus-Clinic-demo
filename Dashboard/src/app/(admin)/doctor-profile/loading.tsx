import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorProfileLoading() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                {/* Banner / Header area */}
                <div className="h-32 bg-gray-100 flex items-center p-6 border-b">
                    <div className="flex gap-6 items-center">
                        <Skeleton className="h-24 w-24 rounded-full border-4 border-white shadow bg-white" />
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Profile Info fields */}
                        <div className="space-y-4 col-span-1 border rounded p-4 border-gray-100">
                            <Skeleton className="h-5 w-24 mb-4" />
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Extended Info fields */}
                        <div className="col-span-1 md:col-span-2 space-y-4 border rounded p-4 border-gray-100">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
