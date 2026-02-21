import React from "react"

export default function BookingSkeleton() {
    return (
        <div className="min-h-screen w-full bg-[#0f172a] text-white p-4 md:p-8 font-sans relative overflow-hidden" dir="rtl">
            <div className="max-w-5xl mx-auto relative z-10 space-y-8 md:space-y-12">
                {/* Profile Skeleton */}
                <div className="flex flex-col items-center gap-8 animate-pulse">
                    <div className="w-56 h-56 rounded-full bg-slate-800" />
                    <div className="space-y-4 w-full max-w-md">
                        <div className="h-8 bg-slate-800 rounded w-3/4 mx-auto" />
                        <div className="h-12 bg-slate-800 rounded w-full" />
                        <div className="flex gap-4">
                            <div className="h-14 bg-slate-800 rounded w-full" />
                            <div className="h-14 bg-slate-800 rounded w-full" />
                        </div>
                    </div>
                </div>

                {/* Form Skeleton */}
                <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-700/50 space-y-8 animate-pulse">
                    <div className="h-10 bg-slate-800 rounded w-1/4" />
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="h-20 bg-slate-800 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
