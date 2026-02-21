"use client";

import { memo } from "react";
import { Building2, CalendarCheck, Users, Clock, UserPlus } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { ClinicStatusWidget } from "@/components/clinic-status-widget";

interface StatsGridProps {
    stats: any;
    clinicStatus: any;
}

export const StatsGrid = memo(function StatsGrid({ stats, clinicStatus }: StatsGridProps) {
    if (stats.isGlobal) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="إجمالي العيادات"
                    value={stats.totalDoctors?.toString() || "0"}
                    description="عيادة مشتركة في المنصة"
                    icon={<Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                    gradient="from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900"
                    iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                />
                <StatCard
                    title="إجمالي المواعيد"
                    value={stats.platformTotalAppointments?.toLocaleString() || "0"}
                    description="موعد مسجل في المنصة"
                    icon={<CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    gradient="from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900"
                    iconBg="bg-blue-100 dark:bg-blue-900/40"
                />
                <StatCard
                    title="إجمالي المرضى"
                    value={stats.platformTotalPatients?.toLocaleString() || "0"}
                    description="مريض مسجل في المنصة"
                    icon={<Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                    gradient="from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                />
                <StatCard
                    title="الطلبات المعلقة بالمنصة"
                    value={stats.pending.toString()}
                    description="بانتظار التأكيد من الأطباء"
                    icon={<Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                    gradient="from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900"
                    iconBg="bg-amber-100 dark:bg-amber-900/40"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="مواعيد اليوم"
                value={stats.todayTotal.toString()}
                description="موعد مجدول"
                icon={<CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                gradient="from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900"
                iconBg="bg-blue-100 dark:bg-blue-900/40"
            />
            <StatCard
                title="مرضى جدد"
                value={stats.newPatients.toString()}
                description="تم تسجيلهم اليوم"
                icon={<UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                gradient="from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900"
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
            />
            <StatCard
                title="طلبات معلقة"
                value={stats.pending.toString()}
                description="بانتظار التأكيد"
                icon={<Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                gradient="from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900"
                iconBg="bg-amber-100 dark:bg-amber-900/40"
            />
            <ClinicStatusWidget
                initialStatus={clinicStatus.isOpen}
                initialReason={clinicStatus.reason}
            />
        </div>
    );
});
