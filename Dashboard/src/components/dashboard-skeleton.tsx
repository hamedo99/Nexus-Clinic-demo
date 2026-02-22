import { Activity } from "lucide-react";

export function DashboardSkeleton() {
    return (
        <div className="space-y-4 md:space-y-8 p-1 animate-pulse" dir="rtl">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-32 border-none shadow-sm p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md" />
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        </div>
                        <div className="mt-4 h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                        <div className="mt-3 h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl h-[300px] border border-gray-100 dark:border-gray-700/50 p-6 flex flex-col justify-between items-center">
                <Activity className="h-10 w-10 mb-4 animate-spin text-gray-300 dark:text-gray-600" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
            </div>

            {/* Bottom Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl h-[600px]" />
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl h-[600px]" />
                </div>
            </div>
        </div>
    );
}
