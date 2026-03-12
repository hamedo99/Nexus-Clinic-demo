"use client";

import { createBooking } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useTransition } from "react";
import { Plus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getDoctorBookingConfig } from "@/lib/actions/appointment";

import { Appointment, Patient } from "@prisma/client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface NewAppointmentButtonProps {
    onOptimisticCreate?: (appointment: any) => void;
    allDoctors?: { id: string; name: string; workingHours?: any }[];
    role?: string;
    doctorId?: string;
    customTrigger?: React.ReactNode;
}

export function NewAppointmentButton({ onOptimisticCreate, allDoctors = [], role, doctorId, customTrigger }: NewAppointmentButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>(allDoctors[0]?.id || "");
    const doctorIdToUse = role === "ADMIN" ? selectedDoctorId : doctorId;

    // Advanced Doctor Settings State
    const [locations, setLocations] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [disabledDays, setDisabledDays] = useState<number[]>([5]);
    const [selectedLocation, setSelectedLocation] = useState<string>("");

    useEffect(() => {
        if (!doctorIdToUse) return;
        getDoctorBookingConfig(doctorIdToUse).then(config => {
            if (config) {
                const locs = (config.clinic_locations as any[]) || [];
                setLocations(locs);
                if (locs.length === 1) {
                    setSelectedLocation(locs[0].name);
                } else {
                    setSelectedLocation("");
                }
                const scheduleData = config.working_hours_schedule as any;
                setSchedule(scheduleData?.slots || []);
                setDisabledDays(config.disabledDaysOfWeek || [5]);
            }
        });
    }, [doctorIdToUse]);

    // Check if a date is disabled
    const isDateDisabled = (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (day < today) return true;
        if (disabledDays.includes(day.getDay())) return true;

        if (selectedLocation && schedule && schedule.length > 0) {
            const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const selectedDayName = dayNames[day.getDay()];
            const hasLocationThisDay = schedule.some((s: any) => s.location === selectedLocation && s.day === selectedDayName);
            if (!hasLocationThisDay) return true;
        }

        return false;
    };

    // Derived Hours Logic
    let validHours: number[] = [];
    if (selectedLocation && date && schedule && schedule.length > 0) {
        const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const curDayName = dayNames[date.getDay()];
        const todaySlots = schedule.filter((s: any) => s.day === curDayName && s.location === selectedLocation);

        todaySlots.forEach((slot: any) => {
            const startH = parseInt(slot.startTime.split(':')[0], 10);
            const endH = parseInt(slot.endTime.split(':')[0], 10);
            for (let i = startH; i < endH; i++) {
                if (!validHours.includes(i)) validHours.push(i);
            }
        });
        validHours.sort((a, b) => a - b);
    }

    // Fallback if no specific schedules found
    if (validHours.length === 0) {
        validHours = Array.from({ length: 24 - 10 + 1 }, (_, i) => 10 + i);
    }

    const [hour, setHour] = useState(validHours[0]?.toString() || "10");
    const [minute, setMinute] = useState("00");

    // Auto update hour when valid hours change
    useEffect(() => {
        if (validHours.length > 0 && !validHours.includes(parseInt(hour))) {
            setHour(validHours[0].toString());
        }
    }, [validHours, hour]);

    const time = `${hour.padStart(2, '0')}:${minute}`;

    const formatHour = (h: number) => {
        const h12 = h % 12 || 12;
        const ampm = h >= 12 ? 'مساءً' : 'صباحاً';
        return `${h12} ${ampm}`;
    };

    const handleCreate = async () => {
        setMessage(null);
        if (!date || !name || !phone || !time) {
            setMessage({ text: "يرجى ملء جميع الحقول واختيار التاريخ والوقت", type: 'error' });
            return;
        }

        const doctorIdToUse = role === "ADMIN" ? selectedDoctorId : doctorId;

        if (!doctorIdToUse) {
            setMessage({ text: "فشل في تحديد الطبيب", type: 'error' });
            return;
        }

        if (locations.length > 0 && !selectedLocation) {
            setMessage({ text: "يرجى اختيار موقع العيادة أولاً", type: 'error' });
            return;
        }

        setOpen(false); // 1. Close modal instantly!
        setLoading(true);
        // Note: loading state is essentially managed by transitions or separate global toasts usually,
        // but since we want the modal gone, showing the toast from external is better.
        // We will just let the optimistic update handle the rest, but the modal disappears instantly.

        if (onOptimisticCreate && date && time) {
            // Very basic optimistic data structure
            const optimisticDate = new Date(date);
            const [hours, minutes] = time.split(":").map(Number);
            optimisticDate.setHours(hours, minutes, 0, 0);

            onOptimisticCreate({
                id: `temp-${Date.now()}`,
                startTime: optimisticDate.toISOString(),
                status: "PENDING",
                patient: { fullName: name, phoneNumber: phone }
            });
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("date", date.toISOString());
        formData.append("time", time);
        formData.append("doctorId", doctorIdToUse);
        if (selectedLocation) formData.append("location", selectedLocation);

        // 3. Heavy lifting
        startTransition(() => {
            createBooking(null, formData).then((result) => {
                setLoading(false);
                if (result.success) {
                    setName("");
                    setPhone("");
                    setHour(validHours[0]?.toString() || "10");
                    setMinute("00");
                    setDate(new Date());
                    router.refresh();
                } else {
                    alert(result.message || "حدث خطأ أثناء الحجز");
                }
            }).catch(e => {
                setLoading(false);
                alert("حدث خطأ غير متوقع");
                console.error(e);
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger ? customTrigger : (
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        حجز موعد جديد
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>حجز موعد جديد</DialogTitle>
                    <DialogDescription>
                        أدخل تفاصيل المريض والموعد أدناه لإنشاء حجز جديد.
                    </DialogDescription>
                </DialogHeader>

                {message && (
                    <div className={cn(
                        "p-3 rounded-lg text-sm font-bold text-center animate-in fade-in zoom-in duration-300",
                        message.type === 'success'
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                    )}>
                        {message.text}
                    </div>
                )}
                <div className="grid gap-4 py-4">
                    {role === "ADMIN" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="doctor" className="text-right">
                                الطبيب
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="اختر الطبيب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allDoctors.map((doc) => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                {doc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            الاسم
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 text-right"
                            required
                        />
                    </div>
                    {locations.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                موقع العيادة
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="اختر الفرع / الموقع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((loc: any) => (
                                            <SelectItem key={loc.name} value={loc.name}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            الهاتف
                        </Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="col-span-3 text-left"
                            dir="ltr"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            الوقت
                        </Label>
                        <div className="col-span-3">
                            <Select value={hour} onValueChange={setHour}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="ساعة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validHours.map(h => (
                                        <SelectItem key={h} value={h.toString()}>
                                            {formatHour(h)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={isDateDisabled}
                        className="rounded-md border shadow"
                    />
                </div>
                <DialogFooter className="flex-row-reverse gap-2">
                    <Button type="submit" onClick={handleCreate} disabled={loading || isPending} className="w-full">
                        {loading || isPending ? "جاري الحجز..." : "حفظ الموعد"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
