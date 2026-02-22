"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Activity, CalendarDays, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getDashboardStats } from "@/lib/actions";

// Sub-components
import { DashboardHeader } from "./dashboard/dashboard-header";
import { StatsGrid } from "./dashboard/stats-grid";
import { AppointmentList } from "./dashboard/appointment-list";
const BookingsChart = dynamic(() => import("./dashboard/bookings-chart").then(mod => mod.BookingsChart), {
    ssr: false,
    loading: () => <div className="h-48 w-full animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-2xl mt-8" />
});

const CalendarView = dynamic(() => import("@/components/calendar-view").then(mod => mod.CalendarView), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 animate-pulse">
            <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
        </div>
    )
});

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

    const activeFilter = (role === "ADMIN" && selectedDoctorId !== "ALL") ? selectedDoctorId : undefined;
    const { data: dashboardData, mutate, refresh, loading } = useDashboardData(initialData, activeFilter);

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

    const { clinicStatus, appointments, stats, chartData } = displayData;

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
            <DashboardHeader
                role={role}
                userName={userName}
                selectedDoctorId={selectedDoctorId}
                setSelectedDoctorId={setSelectedDoctorId}
                allDoctors={allDoctors}
                loading={loading}
                refresh={refresh}
                onOptimisticCreate={handleOptimisticCreate}
                doctorId={doctorId}
            />

            <StatsGrid stats={stats} clinicStatus={clinicStatus} />

            <BookingsChart data={displayData.chartData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Calendar View */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        الجدول الزمني {stats.isGlobal && "(جميع الأطباء)"}
                    </h2>
                    <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b p-4">
                            <CardTitle className="text-base font-medium flex justify-between items-center">
                                <span>عرض التقويم</span>
                                <span className="text-xs font-normal text-muted-foreground bg-white dark:bg-gray-700 px-2 py-1 rounded-md border">
                                    {stats.isGlobal ? "وضع الرقابة" : "ساعات العمل المجدولة"}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[500px] md:h-[600px] p-0 overflow-x-auto" dir="ltr">
                            <div className="min-w-[500px] h-full">
                                <CalendarView appointments={appointments} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointment List */}
                <div className="lg:col-span-2 xl:col-span-1 space-y-4 order-1 lg:order-2">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {stats.isGlobal ? "نظام التنسيق" : "أحدث المواعيد"}
                    </h2>
                    <Card className="border-none shadow-lg h-[500px] md:h-auto md:max-h-[665px] flex flex-col rounded-2xl overflow-hidden">
                        <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <AppointmentList
                                appointments={appointments}
                                isGlobal={stats.isGlobal}
                                role={role}
                                onStatusChange={handleOptimisticStatusChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
