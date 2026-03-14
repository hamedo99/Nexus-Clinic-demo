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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AppointmentActionsProps {
    id: string;
    onStatusChange?: (id: string, status: "CONFIRMED" | "CANCELLED") => void;
    role?: string;
    status?: string;
}

export function AppointmentActions({ id, onStatusChange, role, status }: AppointmentActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("10:00");

    const handleUpdate = async (newStatus: "CONFIRMED" | "CANCELLED") => {
        // 1. Optimistic Update (Lightning Speed!)
        if (onStatusChange) {
            onStatusChange(id, newStatus);
        }

        setLoading(true);
        try {
            // 2. Server Request
            await updateAppointmentStatus(id, newStatus);
            router.refresh(); // Sync server state as backup
        } catch (error) {
            console.error("Failed to update status", error);
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

    if (role === "ADMIN") return null;

    return (
        <div className="flex gap-2 items-center">
            {status !== "CONFIRMED" && (
                <Button
                    variant="default"
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold ml-2 shadow-sm border-0 rounded-lg px-4"
                    onClick={() => handleUpdate("CONFIRMED")}
                    disabled={loading}
                >
                    تأكيد ✓
                </Button>
            )}

            <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
                <DialogTrigger asChild>
                    <button disabled={loading} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-lg transition-colors cursor-pointer" title="تأجيل">
                        ⏱️
                    </button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
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
                            <Select value={time} onValueChange={setTime}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="اختر الساعة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 15 }, (_, i) => 10 + i).map(h => {
                                        const t = `${h.toString().padStart(2, '0')}:00`;
                                        const label = h > 12 ? `${h - 12}:00 مساءً` : (h === 12 ? "12:00 مساءً" : `${h}:00 صباحاً`);
                                        return <SelectItem key={t} value={t}>{label}</SelectItem>
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRescheduling(false)}>إلغاء</Button>
                        <Button onClick={handleReschedule} disabled={loading}>حفظ الموعد الجديد</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCanceling} onOpenChange={setIsCanceling}>
                <DialogTrigger asChild>
                    <button
                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 flex items-center justify-center text-lg transition-colors cursor-pointer"
                        disabled={loading}
                        title="إلغاء الموعد"
                    >
                        ❌
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">تأكيد الإلغاء</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟ 
                            سيتم إخفاؤه مباشرة من الجدول.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsCanceling(false)}>تراجع</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                setIsCanceling(false);
                                handleUpdate("CANCELLED");
                            }}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            تأكيد الإلغاء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
