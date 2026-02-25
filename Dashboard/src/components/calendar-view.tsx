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
    const [activeView, setActiveView] = useState<string>("timeGridDay");

    const events = React.useMemo(() => {
        const groups: Record<number, any[]> = {};

        appointments.forEach(apt => {
            const timeKey = new Date(apt.startTime).getTime();
            if (!groups[timeKey]) groups[timeKey] = [];
            groups[timeKey].push(apt);
        });

        const parsedEvents: any[] = [];

        Object.values(groups).forEach(groupApts => {
            groupApts.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                return a.id.localeCompare(b.id);
            });

            groupApts.forEach((apt, index) => {
                const originalStart = new Date(apt.startTime);

                // Dynamically decide the display boundary based on active view.
                // In Day View, we assign full hour to trigger Fullcalendar's horizontal layout side-by-side.
                // In Week/Month View, we stagger them slightly vertically so they stack.
                let visualStart, visualEnd;

                if (activeView === "timeGridDay") {
                    // Force start/end exactly on the hour, Fullcalendar handles horizontal overlap.
                    visualStart = new Date(originalStart.getTime());
                    visualEnd = new Date(originalStart.getTime() + 60 * 60000);
                } else {
                    // In narrow views, split the hour vertically.
                    const durationMins = 60 / Math.max(groupApts.length, 1);
                    visualStart = new Date(originalStart.getTime() + (index * durationMins) * 60000);
                    visualEnd = new Date(visualStart.getTime() + (durationMins - 1) * 60000);
                }

                parsedEvents.push({
                    id: apt.id,
                    title: `${index + 1}- ${apt.patient.fullName}`,
                    start: visualStart,
                    end: visualEnd,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    textColor: "transparent",
                    extendedProps: {
                        status: apt.status,
                        phone: apt.patient.phoneNumber,
                        originalStart,
                        originalEnd: new Date(apt.endTime),
                        statusClass: apt.status === 'CONFIRMED'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : apt.status === 'CANCELLED'
                                ? 'bg-red-50 border-red-500 text-red-900'
                                : 'bg-amber-50 border-amber-500 text-amber-900'
                    }
                });
            });
        });

        return parsedEvents;
    }, [appointments, activeView]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                .fc-timegrid-slot {
                    height: 5.5rem !important; /* Increase vertical scale for better stacking */
                }
                .fc-event {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    margin-bottom: 2px !important;
                }
            `}} />
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
                slotDuration="01:00:00" // 1 hour slots
                nowIndicator={true}
                slotEventOverlap={activeView === "timeGridDay" ? false : true} // Force side-by-side ONLY in Day view
                eventMaxStack={20}
                datesSet={(arg) => setActiveView(arg.view.type)}
                eventContent={(info) => {
                    const blockStart = info.event.start;
                    const timeString = blockStart ? format(blockStart, 'hh:mm a', { locale: arSA }) : info.timeText;

                    return (
                        <div className={`h-full w-full rounded-md px-1 flex flex-col justify-center overflow-hidden border-t-2 shadow-sm ${info.event.extendedProps.statusClass} ${activeView === 'timeGridDay' ? 'py-1' : 'py-0'}`}>
                            <div className={`font-bold ${activeView === 'timeGridDay' ? 'text-xs leading-tight whitespace-normal' : 'text-[10px] leading-none truncate whitespace-nowrap text-ellipsis mt-0.5'}`}>
                                {info.event.title}
                            </div>
                        </div>
                    );
                }}
                eventClick={(info) => {
                    setSelectedEvent({
                        title: info.event.title.replace(/^\d+- /, ''), // Remove the number prefix if desired, or keep it
                        status: info.event.extendedProps.status,
                        phone: info.event.extendedProps.phone,
                        start: info.event.extendedProps.originalStart,
                        end: info.event.extendedProps.originalEnd
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
