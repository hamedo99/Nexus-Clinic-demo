"use client";

import { memo } from "react";
import { CalendarDays, Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewAppointmentButton } from "@/components/new-appointment-button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
    role?: string;
    userName?: string;
    selectedDoctorId: string;
    setSelectedDoctorId: (id: string) => void;
    allDoctors: { id: string; name: string }[];
    loading: boolean;
    refresh: () => void;
    onOptimisticCreate: (apt: any) => void;
    doctorId?: string;
}

export const DashboardHeader = memo(function DashboardHeader({
    role,
    userName,
    selectedDoctorId,
    setSelectedDoctorId,
    allDoctors,
    loading,
    refresh,
    onOptimisticCreate,
    doctorId
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">لوحة التحكم</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    مرحباً بك، {role === "ADMIN" ? "المدير العام" : (userName || "الطبيب")}
                    {role && <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2 mx-2">
                        {role === "ADMIN" ? "المدير" : role}
                    </span>}
                </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
                {role === "ADMIN" && (
                    <div className="w-[200px]">
                        <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-dashed">
                                <Filter className="w-4 h-4 ml-2 text-muted-foreground" />
                                <SelectValue placeholder="تصفية حسب الطبيب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">جميع العيادات</SelectItem>
                                {allDoctors.map(doctor => (
                                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl text-sm font-medium">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <span>{new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-full ${loading ? "animate-spin text-primary" : "text-muted-foreground hover:text-primary"}`}
                    onClick={refresh}
                    title="تحديث البيانات"
                >
                    <Activity className="h-5 w-5" />
                </Button>

                <NewAppointmentButton
                    onOptimisticCreate={onOptimisticCreate}
                    allDoctors={allDoctors}
                    role={role}
                    doctorId={doctorId}
                />
            </div>
        </div>
    );
});
