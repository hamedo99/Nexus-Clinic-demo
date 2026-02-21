import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsLoading() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            <Card className="border-none shadow-md">
                <CardContent className="p-6 space-y-6">
                    {/* Tabs simulate */}
                    <div className="flex gap-4 border-b pb-4 mb-6">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    <div className="space-y-6">
                        {/* Form Sections simulate */}
                        {[1, 2, 3].map((section) => (
                            <div key={section} className="space-y-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
