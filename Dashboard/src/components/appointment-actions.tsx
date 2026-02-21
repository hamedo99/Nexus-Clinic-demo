"use client";

import { updateAppointmentStatus, rescheduleAppointment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentActionsProps {
    id: string;
    onStatusChange?: (id: string, status: "CONFIRMED" | "CANCELLED") => void;
    role?: string;
}

export function AppointmentActions({ id, onStatusChange, role }: AppointmentActionsProps) {
    if (role === "ADMIN") return null;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("10:00");

    const handleUpdate = async (status: "CONFIRMED" | "CANCELLED") => {
        // 1. Optimistic Update (Lightning Speed!)
        if (onStatusChange) {
            onStatusChange(id, status);
        }

        setLoading(true);
        try {
            // 2. Server Request
            await updateAppointmentStatus(id, status);
            router.refresh(); // Sync server state as backup
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert would happen here if we had a revert callback, 
            // but for now we rely on the next fetch or router.refresh() to fix it if it failed.
            alert("حدث خطأ في تحديث الحالة");
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!date || !time) {
            alert("يرجى اختيار التاريخ والوقت");
            return;
        }

        setLoading(true);
        const result = await rescheduleAppointment(id, date.toISOString(), time);
        setLoading(false);

        if (result.success) {
            setIsRescheduling(false);
            router.refresh();
        } else {
            alert("فشل في تأجيل الموعد");
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdate("CONFIRMED")}
                disabled={loading}
            >
                تأكيد
            </Button>

            <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
                <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" disabled={loading} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                        تأجيل
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأجيل الموعد</DialogTitle>
                        <DialogDescription>
                            يرجى اختيار الموعد الجديد (اليوم والساعة).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex flex-col items-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow"
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="time">الوقت</Label>
                            <Input
                                type="time"
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRescheduling(false)}>إلغاء</Button>
                        <Button onClick={handleReschedule} disabled={loading}>حفظ الموعد الجديد</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleUpdate("CANCELLED")}
                disabled={loading}
            >
                إلغاء
            </Button>
        </div>
    );
}
