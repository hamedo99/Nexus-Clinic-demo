"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import arLocale from '@fullcalendar/core/locales/ar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User, Phone, Calendar as CalendarIcon, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

type AppointmentEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: string;
};

export const CalendarView = React.memo(function CalendarView({ appointments }: { appointments: any[] }) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const events = React.useMemo(() => appointments.map((apt) => ({
        id: apt.id,
        title: apt.patient.fullName,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        backgroundColor: apt.status === "CONFIRMED" ? "#10b981" : "#3b82f6", // Green or Blue
        borderColor: "transparent",
        textColor: "#ffffff",
        extendedProps: {
            status: apt.status,
            phone: apt.patient.phoneNumber
        }
    })), [appointments]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                locale={arLocale}
                direction="rtl"
                slotMinTime="14:00:00"
                slotMaxTime="21:00:00"
                allDaySlot={false}
                events={events}
                height="100%"
                slotDuration="00:20:00" // 20 min slots
                nowIndicator={true}
                eventClick={(info) => {
                    setSelectedEvent({
                        title: info.event.title,
                        status: info.event.extendedProps.status,
                        phone: info.event.extendedProps.phone,
                        start: info.event.start,
                        end: info.event.end
                    });
                }}
            />

            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl" dir="rtl">
                    <DialogHeader className="border-b pb-4 border-slate-100 dark:border-slate-800/60">
                        <DialogTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100 font-bold">
                            <span className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-xl text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
                                <User className="h-5 w-5" />
                            </span>
                            تفاصيل الموعد
                        </DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-6 pt-2">
                            <div className="flex flex-col gap-1 items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
                                <div className="h-16 w-16 mb-2 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center shadow-inner relative z-10">
                                    <User className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 z-10">{selectedEvent.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-mono text-sm z-10 bg-white dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/50 mt-1" dir="ltr">
                                    <Phone className="h-3.5 w-3.5" />
                                    {selectedEvent.phone}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-1">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">التاريخ</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        {selectedEvent.start ? format(selectedEvent.start, 'dd MMMM yyyy', { locale: arSA }) : ''}
                                    </p>
                                </div>
                                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-1">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الوقت</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm font-mono bg-white dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50" dir="ltr">
                                        {selectedEvent.start ? format(selectedEvent.start, 'hh:mm a', { locale: arSA }) : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-l from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <Activity className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">حالة الموعد</span>
                                </div>
                                <span className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm ${selectedEvent.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                                        selectedEvent.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                            'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                                    }`}>
                                    {selectedEvent.status === 'CONFIRMED' ? 'مؤكد ✓' : selectedEvent.status === 'CANCELLED' ? 'ملغي ✕' : 'قيد الانتظار ⏳'}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
});
