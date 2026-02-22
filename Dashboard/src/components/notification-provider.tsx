"use client";

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { format, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { WifiOff } from "lucide-react";
import { useDashboardStore } from "@/lib/store";

export function NotificationProvider() {
    const [lastChecked, setLastChecked] = useState<string>("");
    const [isOffline, setIsOffline] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const addNotification = useDashboardStore(state => state.addNotification);

    // Select all appointments across all doctors to monitor for reminders
    const allData = useDashboardStore(state => state.data);
    const notifiedRef = useRef<Set<string>>(new Set());

    // Initialize the checking time and audio on mount
    useEffect(() => {
        setLastChecked(new Date().toISOString());
        audioRef.current = new Audio("/notification.ogg");
    }, []);

    // Effect 1: Polling for new appointments
    useEffect(() => {
        if (!lastChecked) return;

        let timeoutId: NodeJS.Timeout;
        let pollDelay = 15000;
        let consecutiveErrors = 0;
        const MAX_ERRORS = 3;
        let isCurrent = true;

        const poll = async () => {
            if (!isCurrent) return;

            try {
                const res = await fetch(`/api/appointments/latest?since=${encodeURIComponent(lastChecked)}`);

                if (!isCurrent) return;

                if (!res.ok) {
                    consecutiveErrors++;
                    if (consecutiveErrors >= MAX_ERRORS) setIsOffline(true);
                    pollDelay = Math.min(pollDelay * 1.5, 60000);
                    timeoutId = setTimeout(poll, pollDelay);
                    return;
                }

                setIsOffline(false);
                consecutiveErrors = 0;
                pollDelay = 15000;
                const data = await res.json();

                if (!isCurrent) return;

                if (data.appointments && data.appointments.length > 0) {
                    setLastChecked(data.serverTime || new Date().toISOString());

                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(e => console.error("Sound failed:", e));
                    }

                    data.appointments.forEach((appointment: any) => {
                        const timeStr = format(new Date(appointment.startTime), 'hh:mm a', { locale: ar });

                        // 1. Add to Global Notification Store
                        addNotification({
                            title: "حجز جديد",
                            message: `حجز جديد من المريض (${appointment.patient.fullName}) الساعة ${timeStr}`,
                            type: 'appointment'
                        });

                        // 2. Show Toast
                        toast.success(`${appointment.patient.fullName} - ${timeStr}`, {
                            duration: 5000,
                            position: 'bottom-right',
                            icon: '🗓️',
                            style: { background: '#0f172a', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
                        });
                    });
                } else {
                    timeoutId = setTimeout(poll, pollDelay);
                }
            } catch (error) {
                if (!isCurrent) return;
                consecutiveErrors++;
                if (consecutiveErrors >= MAX_ERRORS) setIsOffline(true);
                pollDelay = Math.min(pollDelay * 2, 120000);
                timeoutId = setTimeout(poll, pollDelay);
            }
        };

        timeoutId = setTimeout(poll, pollDelay);
        return () => {
            isCurrent = false;
            clearTimeout(timeoutId);
        };
    }, [lastChecked, addNotification]);

    // Effect 2: Reminders & Milestones
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Combine all appointments for monitoring
            const appointments = Object.values(allData).flatMap(d => d.appointments);
            let todayCount = 0;

            appointments.forEach(app => {
                const startTime = new Date(app.startTime);

                // Track total for today
                if (isSameDay(startTime, now)) todayCount++;

                // Reminder: 10 minutes before
                const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
                const reminderKey = `reminder-${app.id}`;

                if (diffMinutes > 0 && diffMinutes <= 10 && !notifiedRef.current.has(reminderKey)) {
                    notifiedRef.current.add(reminderKey);
                    addNotification({
                        title: "تذكير موعد",
                        message: `لديك موعد بعد ${Math.round(diffMinutes)} دقائق مع (${app.patient.fullName})`,
                        type: 'reminder'
                    });
                    toast(`موعد بعد قليل: ${app.patient.fullName}`, { icon: '⏰' });
                }
            });

            // Milestone: Total Today
            const milestoneKey = `milestone-${today.getTime()}-20`;
            if (todayCount >= 20 && !notifiedRef.current.has(milestoneKey)) {
                notifiedRef.current.add(milestoneKey);
                addNotification({
                    title: "إنجاز العمل",
                    message: `اكتملت حجوزات اليوم (${todayCount} مريضاً). عمل رائع!`,
                    type: 'success'
                });
            }
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [allData, addNotification]);

    return (
        <>
            <Toaster />
            {isOffline && (
                <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold animate-pulse">
                    <WifiOff size={16} />
                    <span>غير متصل - جاري المحاولة...</span>
                </div>
            )}
        </>
    );
}
