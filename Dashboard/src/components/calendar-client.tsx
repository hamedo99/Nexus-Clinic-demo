"use client";

import { CalendarView } from "@/components/calendar-view";
import { useCachedData } from "@/hooks/use-cached-data";
import { getCalendarAppointments } from "@/lib/actions";
import { useCallback } from "react";

export function CalendarClient({ initialAppointments }: { initialAppointments?: any[] }) {
    const fetcher = useCallback(() => getCalendarAppointments(), []);

    const { data: appointments, loading } = useCachedData(
        "calendar_appointments",
        fetcher,
        initialAppointments
    );

    return (
        <div className="h-full flex flex-col p-4" dir="rtl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">التقويم الكامل</h1>

            <div className="flex-1 min-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" dir="ltr">
                <div className="h-full w-full p-2">
                    {loading && !appointments ? (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">جاري تحميل التقويم...</div>
                    ) : (
                        <CalendarView appointments={appointments || []} />
                    )}
                </div>
            </div>
        </div>
    );
}
