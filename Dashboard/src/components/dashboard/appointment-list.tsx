"use client";

import { memo } from "react";
import { CalendarDays, Clock, Activity, Users } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { AppointmentActions } from "@/components/appointment-actions";

interface AppointmentListProps {
    appointments: any[];
    isGlobal?: boolean;
    role?: string;
    onStatusChange: (id: string, newStatus: "CONFIRMED" | "CANCELLED") => void;
}

export const AppointmentList = memo(function AppointmentList({ appointments, isGlobal, role, onStatusChange }: AppointmentListProps) {
    if (isGlobal && appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">وضع الرقابة العامة نشط</h3>
                <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70 max-w-[250px] leading-relaxed">
                    لم يتم عرض الإشعارات الفردية لتقليل الفوضى. يرجى اختيار طبيب محدد.
                </p>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed m-2">
                <CalendarDays className="h-12 w-12 mb-3 opacity-20" />
                <p>لا توجد مواعيد قادمة اليوم</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {appointments.map((appointment) => (
                <div
                    key={appointment.id}
                    className="group flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden shrink-0"
                >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${appointment.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${appointment.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                }`}>
                                {appointment.patient.fullName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                    {appointment.patient.fullName}
                                </h4>
                                <div className="flex flex-col gap-1 mt-0.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-medium font-mono dir-ltr">
                                            {new Date(appointment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                    {isGlobal && appointment.doctor && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                                            <Activity className="h-2 w-2" />
                                            <span>{appointment.doctor.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${appointment.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-transparent'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-transparent'
                            }`}>
                            {appointment.status === 'CONFIRMED' ? 'مؤكد' : 'انتظار'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-1">
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {appointment.patient.phoneNumber}
                        </p>
                        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                            <AppointmentActions
                                id={appointment.id}
                                onStatusChange={onStatusChange}
                                role={role}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});
