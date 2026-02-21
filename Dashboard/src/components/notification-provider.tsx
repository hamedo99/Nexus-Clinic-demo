"use client";

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function NotificationProvider() {
    const [lastChecked, setLastChecked] = useState<string>("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize the checking time and audio on mount
    useEffect(() => {
        setLastChecked(new Date().toISOString());
        audioRef.current = new Audio("/notification.ogg");
    }, []);

    useEffect(() => {
        if (!lastChecked) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/appointments/latest?since=${encodeURIComponent(lastChecked)}`);
                if (!res.ok) return;

                const data = await res.json();

                if (data.appointments && data.appointments.length > 0) {
                    // Update checking time
                    setLastChecked(data.serverTime || new Date().toISOString());

                    // Play sound
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(e => console.error("Could not play sound:", e));
                    }

                    // Show a toast for each new appointment
                    data.appointments.forEach((appointment: any) => {
                        const timeStr = format(new Date(appointment.startTime), 'hh:mm a', { locale: ar });

                        toast.success(
                            `يوجد حجز جديد الآن!
                            المريض: ${appointment.patient.fullName}
                            الوقت: ${timeStr}`,
                            {
                                duration: 5000,
                                position: 'top-left',
                                icon: '🔔',
                                style: {
                                    background: '#1e293b',
                                    color: '#fff',
                                    border: '1px solid #334155',
                                    fontWeight: 'bold',
                                    padding: '16px',
                                    borderRadius: '12px'
                                },
                            }
                        );
                    });
                }
            } catch (error) {
                console.error("Error polling appointments:", error);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [lastChecked]);

    return <Toaster />;
}
