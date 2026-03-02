"use client";

import { memo } from "react";
import { CalendarDays, Clock, Activity, Users } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { AppointmentActions } from "@/components/appointment-actions";

interface AppointmentListProps {
    appointments: any[];
    isGlobal?: boolean;
    role?: string;
    searchQuery?: string;
    onStatusChange: (id: string, newStatus: "CONFIRMED" | "CANCELLED") => void;
}

export const AppointmentList = memo(function AppointmentList({ appointments, isGlobal, role, searchQuery, onStatusChange }: AppointmentListProps) {
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
            {appointments.map((appointment) => (
                <div
                    key={appointment.id}
                    className="flex flex-col md:flex-row items-center justify-between py-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default"
                >
                    {/* Group 1 (Right - Patient Info) */}
                    <div className="flex items-center gap-4 w-full md:w-1/3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center font-black text-lg md:text-xl shrink-0 bg-primary/10 text-primary dark:bg-primary/20">
                            {appointment.patient.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base md:text-lg text-slate-800 dark:text-gray-100 truncate max-w-[200px] leading-tight mb-1">
                                {appointment.patient.fullName}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium font-mono dir-ltr w-fit leading-none">
                                {appointment.patient.phoneNumber}
                            </span>
                        </div>
                    </div>

                    {/* Group 2 (Center - Time & Status) */}
                    <div className="flex items-center justify-start md:justify-center gap-4 w-full md:w-1/3 mt-3 md:mt-0">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-gray-300 font-mono dir-ltr bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {(() => {
                                const apptDate = new Date(appointment.startTime);
                                const isToday = new Date().setHours(0, 0, 0, 0) === new Date(apptDate).setHours(0, 0, 0, 0);
                                const timeString = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                                if (!isToday || searchQuery) {
                                    const dateString = apptDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
                                    return `${dateString} | ${timeString}`;
                                }
                                return timeString;
                            })()}
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-none border ${appointment.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/50'
                            : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-800/50'
                            }`}>
                            {appointment.status === 'CONFIRMED' ? 'مؤكد' : 'انتظار'}
                        </span>
                    </div>

                    {/* Group 3 (Left - Actions) */}
                    <div className="flex items-center justify-end gap-2 w-full md:w-1/3 mt-3 md:mt-0">
                        <AppointmentActions
                            id={appointment.id}
                            status={appointment.status}
                            onStatusChange={onStatusChange}
                            role={role}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
});
