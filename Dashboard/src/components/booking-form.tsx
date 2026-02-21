"use client";

import { useActionState, useEffect, useState } from "react";
import { createBooking } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full h-12 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]"
            disabled={pending}
        >
            {pending ? "جاري الحجز..." : "تأكيد الحجز"}
        </Button>
    );
}

// Generate time slots based on working hours
function generateTimeSlots(workingHours?: { start: number, end: number }) {
    const slots = [];
    const start = workingHours?.start ?? 14;
    const end = workingHours?.end ?? 21;

    for (let i = start; i < end; i++) {
        slots.push(`${i}:00`);
        slots.push(`${i}:20`);
        slots.push(`${i}:40`);
    }
    return slots;
}

export function BookingForm({ doctor }: { doctor: any }) {
    const workingHours = doctor.workingHours as { start: number, end: number } | undefined;
    const [state, formAction] = useActionState(createBooking, null);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const slots = generateTimeSlots(workingHours);

    return (
        <form action={formAction} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <input type="hidden" name="doctorId" value={doctor.id} />
            {/* Ensure date is always sent, defaults to today if undefined */}
            <input type="hidden" name="date" value={date ? date.toISOString() : new Date().toISOString()} />

            {/* Patient Info Section */}
            <div className="bg-white/50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 text-right">بياناتك الشخصية</h3>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 text-right">
                        <Label htmlFor="name" className="text-base">الاسم الكامل</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="مثال: علي محمد حسن"
                            required
                            className="text-right h-12 text-lg bg-white/80 focus:bg-white transition-colors"
                            dir="rtl"
                        />
                    </div>
                    <div className="space-y-2 text-right">
                        <Label htmlFor="phone" className="text-base">رقم الهاتف</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="07xxxxxxxxx"
                            required
                            type="tel"
                            className="text-right h-12 text-lg bg-white/80 focus:bg-white transition-colors"
                            dir="ltr" // Phone numbers LTR usually better
                        />
                    </div>
                </div>
            </div>

            {/* Date & Time Selection Section */}
            <div className="bg-white/50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 text-right">تحديد الموعد</h3>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar Column */}
                    <div className="flex flex-col items-center">
                        <Label className="mb-4 text-base font-medium text-gray-600 block w-full text-right">اختر اليوم</Label>
                        <div className="p-4 bg-white rounded-xl shadow-sm border w-full flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-none"
                                disabled={(date) => date < new Date() || date.getDay() === 5}
                            />
                        </div>
                    </div>

                    {/* Time Slots Column */}
                    <div className="flex flex-col">
                        <Label className="mb-4 text-base font-medium text-gray-600 block w-full text-right">الخانات الزمنية المتاحة</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {slots.map((time) => (
                                <div key={time} className="relative group">
                                    <input
                                        type="radio"
                                        name="time"
                                        value={time}
                                        id={`slot-${time}`}
                                        className="peer sr-only"
                                        required
                                    />
                                    <Label
                                        htmlFor={`slot-${time}`}
                                        className="flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-white 
                                hover:border-primary/50 hover:bg-primary/5 hover:text-primary 
                                peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary peer-checked:shadow-md peer-checked:scale-105
                                cursor-pointer transition-all duration-200 text-sm font-bold shadow-sm h-full w-full select-none"
                                    >
                                        {time}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {state?.message && (
                <div className={cn(
                    "p-4 rounded-xl text-center font-bold text-lg animate-in fade-in zoom-in duration-300 shadow-sm",
                    state.success ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                )}>
                    {state.message}
                </div>
            )}

            <SubmitButton />

            <p className="text-xs text-center text-gray-400 mt-6">
                البيانات محفوظة ومشفرة وفقاً لسياسة الخصوصية
            </p>
        </form>
    );
}
