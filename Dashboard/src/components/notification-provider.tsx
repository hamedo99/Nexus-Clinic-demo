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

        let timeoutId: NodeJS.Timeout;
        let pollDelay = 10000; // start with 10 seconds

        const poll = async () => {
            try {
                const res = await fetch(`/api/appointments/latest?since=${encodeURIComponent(lastChecked)}`);
                if (!res.ok) {
                    // Increase delay on failure, max 1 minute
                    pollDelay = Math.min(pollDelay * 1.5, 60000);
                    timeoutId = setTimeout(poll, pollDelay);
                    return;
                }

                // Reset delay on success
                pollDelay = 10000;
                const data = await res.json();

                if (data.appointments && data.appointments.length > 0) {
                    setLastChecked(data.serverTime || new Date().toISOString());

                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(e => console.error("Could not play sound:", e));
                    }

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
                                style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', fontWeight: 'bold', padding: '16px', borderRadius: '12px' }
                            }
                        );
                    });
                }
            } catch (error) {
                console.error("Error polling appointments:", error);
                pollDelay = Math.min(pollDelay * 1.5, 60000);
            } finally {
                timeoutId = setTimeout(poll, pollDelay);
            }
        };

        timeoutId = setTimeout(poll, pollDelay);

        return () => clearTimeout(timeoutId);
    }, [lastChecked]);

    return <Toaster />;
}
