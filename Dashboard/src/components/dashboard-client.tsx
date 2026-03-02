"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Activity, CalendarDays, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getDashboardStats } from "@/lib/actions";

// Sub-components
import { AppointmentList } from "./dashboard/appointment-list";
import { NewAppointmentButton } from "@/components/new-appointment-button";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

type DashboardData = Awaited<ReturnType<typeof getDashboardStats>>;

interface DashboardClientProps {
    initialData: DashboardData;
    role?: string;
    userName?: string;
    doctorId?: string;
    allDoctors?: { id: string; name: string }[];
}

export function DashboardClient({ initialData, role, userName, doctorId, allDoctors = [] }: DashboardClientProps) {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("ALL");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const activeFilter = (role === "ADMIN" && selectedDoctorId !== "ALL") ? selectedDoctorId : undefined;

    const isToday = new Date().setHours(0, 0, 0, 0) === new Date(currentDate).setHours(0, 0, 0, 0);
    const dateParam = isToday ? undefined : currentDate.toISOString();

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q")?.toString() || undefined;

    const { data: dashboardData, mutate, refresh, loading } = useDashboardData(initialData, activeFilter, dateParam, searchQuery);

    const displayData = dashboardData || initialData;

    if (!displayData) {
        return (
            <div className="flex h-screen items-center justify-center p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-12 w-12 animate-spin text-primary" />
                    <p>جاري تحميل لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    const { clinicStatus, appointments, stats } = displayData;

    const handleOptimisticStatusChange = useCallback((id: string, newStatus: "CONFIRMED" | "CANCELLED") => {
        const newData = { ...displayData };
        const originalAppointment = newData.appointments.find((apt: any) => apt.id === id);
        if (!originalAppointment) return;

        const originalStatus = originalAppointment.status;
        newData.appointments = newData.appointments.map((apt: any) => apt.id === id ? { ...apt, status: newStatus } : apt);

        const newStats = { ...newData.stats };
        if (originalStatus === "PENDING" && newStatus === "CONFIRMED") {
            newStats.pending = Math.max(0, newStats.pending - 1);
        } else if (originalStatus === "CONFIRMED" && newStatus === "CANCELLED") {
            newStats.todayTotal = Math.max(0, newStats.todayTotal - 1);
        } else if (originalStatus === "PENDING" && newStatus === "CANCELLED") {
            newStats.pending = Math.max(0, newStats.pending - 1);
            newStats.todayTotal = Math.max(0, newStats.todayTotal - 1);
        }

        newData.stats = newStats;
        mutate(newData);
    }, [displayData, mutate]);

    const handleOptimisticCreate = useCallback((newAppointment: any) => {
        const newData = { ...displayData };
        newData.appointments = [...newData.appointments, newAppointment].sort((a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const newStats = { ...newData.stats };
        newStats.todayTotal += 1;
        if (newAppointment.status === "PENDING") newStats.pending += 1;

        newData.stats = newStats;
        mutate(newData);
        setTimeout(() => refresh(), 1000); // Background resync
    }, [displayData, mutate, refresh]);

    return (
        <div className="space-y-4 md:space-y-8 p-1" dir="rtl">


            <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-4 md:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-5xl mx-auto mt-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-xl font-bold">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors h-10 w-10 text-gray-500 dark:text-gray-400 rounded-full" onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                        <div className="text-xl md:text-2xl font-bold flex items-center gap-2 min-w-[150px] justify-center text-slate-800 dark:text-gray-100">
                            {currentDate.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors h-10 w-10 text-gray-500 dark:text-gray-400 rounded-full" onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pr-2">
                        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                            📅 إجمالي المواعيد: {stats.todayTotal}
                        </span>
                        {stats.pending > 0 ? (
                            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-800/50">
                                🔴 طلبات بانتظار التأكيد: {stats.pending}
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/50">
                                ✅ لا توجد طلبات معلقة
                            </span>
                        )}
                    </div>
                </div>

                <NewAppointmentButton
                    onOptimisticCreate={handleOptimisticCreate}
                    allDoctors={allDoctors}
                    role={role}
                    doctorId={doctorId}
                    customTrigger={
                        <Button className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-primary hover:bg-primary/95 text-white flex gap-2 items-center px-6 py-2.5 font-semibold shrink-0">
                            <span>➕ حجز موعد جديد</span>
                        </Button>
                    }
                />
            </div>

            <div className="max-w-5xl mx-auto space-y-4">
                <AppointmentList
                    appointments={appointments}
                    isGlobal={stats.isGlobal}
                    role={role}
                    searchQuery={searchQuery}
                    onStatusChange={handleOptimisticStatusChange}
                />
            </div>
        </div>
    );
}
