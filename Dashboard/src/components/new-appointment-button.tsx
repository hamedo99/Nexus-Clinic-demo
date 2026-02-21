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
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function NewAppointmentButton({ onOptimisticCreate, allDoctors = [], role, doctorId }: NewAppointmentButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>(allDoctors[0]?.id || "");

    // Find current doctor's working hours
    const currentDoctor = allDoctors.find(d => d.id === (role === "ADMIN" ? selectedDoctorId : doctorId));
    const workingHours = (currentDoctor?.workingHours as any) || { start: 14, end: 21 };

    // Generate valid hours based on working hours
    const validHours = Array.from(
        { length: workingHours.end - workingHours.start },
        (_, i) => workingHours.start + i
    );

    const [hour, setHour] = useState(validHours[0]?.toString() || "14");
    const [minute, setMinute] = useState("00");

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

        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("date", date.toISOString());
        formData.append("time", time);
        formData.append("doctorId", doctorIdToUse);

        try {
            const result = await createBooking(null, formData);
            if (result.success) {
                setMessage({ text: "تم حجز الموعد بنجاح!", type: 'success' });

                // Reset form
                setName("");
                setPhone("");
                setHour(validHours[0]?.toString() || "14");
                setMinute("00");
                setDate(new Date());

                // Auto close after success
                setTimeout(() => {
                    setOpen(false);
                    setMessage(null);
                }, 2000);
            } else {
                setMessage({ text: result.message || "حدث خطأ أثناء الحجز", type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: "حدث خطأ غير متوقع", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    حجز موعد جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
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
                        <div className="col-span-3 flex gap-2">
                            <Select value={hour} onValueChange={setHour}>
                                <SelectTrigger className="flex-1">
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

                            <Select value={minute} onValueChange={setMinute}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="دقيقة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["00", "20", "40"].map(m => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow"
                        />
                    </div>
                </div>
                <DialogFooter className="flex-row-reverse gap-2">
                    <Button type="submit" onClick={handleCreate} disabled={loading} className="w-full">
                        {loading ? "جاري الحفظ..." : "حفظ الموعد"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
