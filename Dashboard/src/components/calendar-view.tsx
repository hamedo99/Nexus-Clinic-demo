"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import arLocale from '@fullcalendar/core/locales/ar';

type AppointmentEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: string;
};

export const CalendarView = React.memo(function CalendarView({ appointments }: { appointments: any[] }) {
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
                    alert(`المريض: ${info.event.title}\nالحالة: ${info.event.extendedProps.status}`);
                }}
            />
        </div>
    );
});
