"use client"
import React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User, Phone, Check, Wallet, CreditCard, Camera, Share2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { arSA } from "date-fns/locale"
import { createBooking, getMonthAvailability } from "@/app/actions/booking"
import { BookingConfig } from "@/lib/shared-logic/types"

// Types for availability
interface AvailabilityData {
    blockedPeriods: { start: Date, end: Date, reason: string | null }[];
    fullyBookedDates: string[];
    fullSlots: Record<string, number[]>;
    exactBookedSlots: Record<string, string[]>;
}

export default function BookingForm({ config, doctorId }: { config?: BookingConfig, doctorId?: string }) {
    // Prevent Hydration Errors on Vercel
    const [isMounted, setIsMounted] = React.useState(false)

    // State
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
    const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(undefined) // initialized in useEffect later
    const [step, setStep] = React.useState(1)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [errorState, setErrorState] = React.useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: "" })
    const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "zain">("cash")
    const [availability, setAvailability] = React.useState<AvailabilityData>({ blockedPeriods: [], fullyBookedDates: [], fullSlots: {}, exactBookedSlots: {} })
    const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
        setDate(new Date())
        setCurrentMonth(new Date())
    }, [])

    // Lazy load confetti
    const triggerConfetti = React.useCallback(async () => {
        const confetti = (await import("canvas-confetti")).default
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    const [formData, setFormData] = React.useState({ name: "", phone: "" })
    const [errors, setErrors] = React.useState({ name: "", phone: "" })

    // Default config if not provided
    const defaultConfig = {
        workingHours: { start: 14, end: 21 }, // 2 PM - 9 PM
        patientsPerHour: 4,
        consultationPrice: 25000,
        slotDuration: 20
    };

    const activeConfig = config || defaultConfig;

    // Fetch availability when month changes
    React.useEffect(() => {
        if (!currentMonth) return;
        const fetchAvailability = async () => {
            setIsLoadingAvailability(true);
            try {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1; // getMonth is 0-indexed
                const data = await getMonthAvailability(year, month, doctorId);
                setAvailability(data);
            } catch (error) {
                console.error("Failed to fetch availability", error);
            } finally {
                setIsLoadingAvailability(false);
            }
        };

        fetchAvailability();
    }, [currentMonth]);

    // Check if a date is disabled
    const isDateDisabled = React.useCallback((day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Disable past dates
        if (day < today) return true;

        const dayStr = format(day, "yyyy-MM-dd");

        // Check if fully booked
        if (availability.fullyBookedDates.includes(dayStr)) return true;

        // Check if blocked
        for (const period of availability.blockedPeriods) {
            const start = new Date(period.start);
            const end = new Date(period.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            if (day >= start && day <= end) return true;
        }

        return false;
    }, [availability]);

    // Dynamically generate time slots based on working hours and slot duration
    const timeSlots = React.useMemo(() => {
        if (!date) return [];

        const slots = [];
        const startHour = activeConfig.workingHours.start;
        const endHour = activeConfig.workingHours.end;
        const duration = activeConfig.slotDuration || 20;

        let currentTime = new Date(date);
        currentTime.setHours(startHour, 0, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, 0, 0, 0);

        const dayStr = format(date, "yyyy-MM-dd");
        const fullHours = availability.fullSlots[dayStr] || [];
        const exactBooked = availability.exactBookedSlots?.[dayStr] || [];

        // Check if today
        const now = new Date();
        const isToday = isSameDay(date, now);

        while (currentTime < endTime) {
            const h = currentTime.getHours();
            const m = currentTime.getMinutes();

            const slotTimeStr24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const isSlotExactBooked = exactBooked.includes(slotTimeStr24);

            // Check if this specific slot "block" (hour) is full
            // Note: Our backend returns "full hours" based on patientsPerHour.
            // If we want finer granularity (slot-based blocking), backend needs update to return full SLOTS not HOURS.
            // Currently, if an hour is in 'fullSlots', we disable all slots in that hour.
            const isHourFull = fullHours.includes(h);

            // Check if slot is in the past (only for today)
            const isPast = isToday && currentTime < now;

            const hour12 = h > 12 ? h - 12 : (h === 0 || h === 24 ? 12 : h);
            const ampm = h >= 12 && h < 24 ? "PM" : "AM";

            const timeString = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

            slots.push({
                time: timeString,
                disabled: isHourFull || isPast || isSlotExactBooked,
                isFull: isHourFull,
                isPast: isPast,
                isBooked: isSlotExactBooked
            });

            // Increment by slot duration
            currentTime.setMinutes(currentTime.getMinutes() + duration);
        }

        return slots;
    }, [activeConfig, date, availability]);

    const steps = [1, 2, 3, 4]

    // Handlers
    const handlePrevMonth = React.useCallback(() => {
        const newDate = new Date(currentMonth || new Date())
        newDate.setMonth(newDate.getMonth() - 1)
        setCurrentMonth(newDate)
    }, [currentMonth]);

    const handleNextMonth = React.useCallback(() => {
        const newDate = new Date(currentMonth || new Date())
        newDate.setMonth(newDate.getMonth() + 1)
        setCurrentMonth(newDate)
    }, [currentMonth]);

    const validateStep2 = React.useCallback(() => {
        let isValid = true
        const newErrors = { name: "", phone: "" }

        if (formData.name.trim().length < 2) {
            newErrors.name = "يرجى إدخال الاسم الكامل"
            isValid = false
        }
        const phoneRegex = /^07\d{9}$/
        if (!formData.phone.trim()) {
            newErrors.phone = "يرجى إدخال رقم الهاتف"
            isValid = false
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "يجب أن يبدأ ب 07 ويتكون من 11 رقم"
            isValid = false
        }
        setErrors(newErrors)
        return isValid
    }, [formData]);

    const handleNext = React.useCallback(async () => {
        if (step === 1 && date && selectedTime) {
            setStep(2)
        } else if (step === 2 && validateStep2()) {
            if (!selectedTime || !date) {
                setErrorState({ isOpen: true, message: "يرجى اختيار الموعد أولاً" })
                return
            }
            setStep(3)
        } else if (step === 3) {
            setIsSubmitting(true)
            try {
                const formatTimeForServer = (timeStr: string) => {
                    const [time, modifier] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':');
                    if (hours === '12') hours = modifier === 'PM' ? '12' : '00';
                    else if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
                    return `${hours.padStart(2, '0')}:${minutes}`;
                };

                const formDataToSend = new FormData();
                formDataToSend.append("name", formData.name);
                formDataToSend.append("phone", formData.phone);
                formDataToSend.append("date", format(date!, "yyyy-MM-dd"));
                formDataToSend.append("time", formatTimeForServer(selectedTime!));
                if (doctorId) {
                    formDataToSend.append("doctorId", doctorId);
                }

                const result = await createBooking(null, formDataToSend)
                if (result.success) {
                    setStep(4)
                    triggerConfetti()
                } else {
                    setErrorState({ isOpen: true, message: result.message || "حدث خطأ ما" })
                }
            } catch (error) {
                console.error(error)
                setErrorState({ isOpen: true, message: "حدث خطأ في الاتصال بالخادم" })
            } finally {
                setIsSubmitting(false)
            }
        }
    }, [step, date, selectedTime, formData, doctorId, validateStep2, triggerConfetti]);

    const handleBack = React.useCallback(() => {
        if (step > 1) setStep(step - 1)
    }, [step]);

    const handleReset = React.useCallback(() => {
        setStep(1);
        setDate(new Date());
        setSelectedTime(null);
        setFormData({ name: "", phone: "" });
    }, []);

    // Stable structure for hydration
    const renderContent = () => {
        if (!isMounted) {
            return <div className="w-full min-h-[400px] flex items-center justify-center"><div className="animate-pulse bg-slate-800/20 w-full h-[400px] rounded-[32px]"></div></div>;
        }

        return (
            <div className="w-full relative">
                {/* Stepper */}
                <div className="flex justify-center items-center py-6 sticky top-0 z-30 backdrop-blur-xl md:backdrop-blur-none rounded-b-2xl mb-4">
                    <div className="flex items-center gap-3 md:gap-6 bg-[#0f172a]/90 p-2 md:p-3 rounded-full border border-slate-800 shadow-xl backdrop-blur-md">
                        {steps.map((s, idx) => (
                            <div key={s} className="flex items-center">
                                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-500 border relative",
                                    step === s ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] scale-110 z-10" : step > s ? "bg-cyan-900/30 border-cyan-800 text-cyan-400" : "bg-slate-800/50 border-slate-700 text-slate-600")}>
                                    {step > s ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : s}
                                </div>
                                {idx < steps.length - 1 && <div className={cn("w-6 md:w-10 h-0.5 mx-1 transition-colors duration-500", step > s ? "bg-cyan-800" : "bg-slate-800")} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px] relative">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full space-y-6">
                            {/* Legend UI */}
                            <div className="flex flex-row justify-center items-center gap-4 text-xs text-slate-400 bg-slate-900/40 border border-slate-800/60 p-3 rounded-2xl w-fit mx-auto backdrop-blur-md" dir="rtl">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800/60 border border-slate-700 shrink-0"></div>
                                    <span>الرمادي: أيام سابقة أو أوقات غير متاحة</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 dir-rtl">
                                <Card className="glass-effect border-0 p-6 md:p-8 rounded-[32px] overflow-hidden flex flex-col items-center relative order-1 lg:order-2 bg-slate-900/40 backdrop-blur-md shadow-xl ring-1 ring-white/5">
                                    <div className="w-full flex justify-between items-center mb-6 px-2 ltr-force-header" dir="ltr">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></Button>
                                            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></Button>
                                            {isLoadingAvailability && <div className="animate-spin text-cyan-500 ml-2"><Clock className="w-4 h-4" /></div>}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-200 capitalize w-full text-right pr-4 tracking-wide">{currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: arSA }) : ''}</h3>
                                    </div>
                                    <Calendar mode="single" selected={date} onSelect={setDate} month={currentMonth || new Date()} onMonthChange={setCurrentMonth} locale={arSA} className="p-0 pointer-events-auto rounded-md border-0 w-full calendar-ltr font-sans"
                                        disabled={isDateDisabled}
                                        classNames={{ months: "w-full", month: "space-y-4 w-full", caption: "hidden", table: "w-full border-collapse space-y-2", weekdays: "flex justify-between w-full mb-4 px-2", weekday: "text-slate-500 rounded-md w-10 font-bold text-[0.75rem] uppercase tracking-wider", week: "flex w-full mt-2 justify-between px-2", day: "h-9 w-9 p-0 font-medium text-slate-400 aria-selected:opacity-100 hover:text-white hover:bg-slate-800 rounded-full transition-all flex items-center justify-center relative", selected: "bg-cyan-600 text-white hover:bg-cyan-600 hover:text-white shadow-lg shadow-cyan-900/50 font-bold scale-110 z-10", today: "text-cyan-400 font-bold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-cyan-400 after:rounded-full", outside: "text-slate-800 opacity-20", disabled: "text-slate-500 bg-slate-800/40 opacity-50 selection:bg-transparent hover:bg-transparent cursor-not-allowed", hidden: "invisible" }}
                                    />
                                </Card>
                                <Card className="glass-effect border-0 p-6 md:p-8 rounded-[32px] flex flex-col min-h-[400px] order-2 lg:order-1 relative overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-xl ring-1 ring-white/5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
                                    <div className="flex items-center gap-3 mb-6 relative z-10 text-right w-full justify-start" dir="rtl">
                                        <div className="w-8 h-8 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(8,145,178,0.2)]"><Clock className="w-4 h-4" /></div>
                                        <h3 className="text-xl font-bold text-slate-200">الأوقات المتاحة</h3>
                                    </div>
                                    {!date ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50 relative z-10 animate-pulse"><CalendarIcon className="w-12 h-12 stroke-[1.5]" /><p>الرجاء اختيار يوم أولاً</p></div>
                                    ) : (
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar relative z-10" dir="ltr">
                                            {timeSlots.map(({ time, disabled, isFull, isBooked }) => (
                                                <button key={time} onClick={() => !disabled && setSelectedTime(time)} disabled={disabled} className={cn("min-h-[50px] w-full px-2 rounded-xl text-center text-sm md:text-base font-bold transition-all duration-300 border relative overflow-hidden group flex items-center justify-center",
                                                    disabled ?
                                                        "opacity-40 cursor-not-allowed bg-slate-800/40 border-slate-700/50 text-slate-500 line-through decoration-slate-600"
                                                        :
                                                        selectedTime === time ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/30 scale-[1.05]" : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:border-slate-500 hover:text-slate-200 hover:shadow-md")}>
                                                    <span className="relative z-10 font-sans tracking-widest block translate-y-[1px] md:translate-y-0 leading-none">{time}</span>
                                                    {selectedTime === time && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] translate-x-[-100%] animate-shimmer" />}
                                                    {disabled && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[120%] h-[1px] bg-red-900/30 rotate-12" /></div>}
                                                </button>
                                            ))}
                                            {timeSlots.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">لا توجد أوقات متاحة لهذا اليوم</div>}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                            <Card className="glass-effect border-0 p-6 md:p-10 rounded-[32px] relative overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-2xl ring-1 ring-white/5">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                                <div className="flex items-center gap-4 mb-8 relative z-10 text-right w-full justify-start border-b border-slate-800 pb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(8,145,178,0.2)]"><User className="w-6 h-6" /></div>
                                    <div><h3 className="text-2xl font-bold text-white mb-1">البيانات الشخصية</h3><p className="text-slate-400 text-sm">يرجى ملء البيانات التالية لإكمال الحجز</p></div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-300 text-base font-medium pr-1">الاسم الكامل</Label>
                                        <div className="relative group">
                                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn("h-14 bg-slate-950/50 border-slate-800 text-right pr-12 text-lg focus:ring-cyan-500/50 focus:border-cyan-500 transition-all rounded-xl", errors.name && "border-red-500/50 focus:ring-red-500/20")} placeholder="أدخل اسمك الكامل" />
                                            <User className="absolute right-4 top-4 text-slate-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        {errors.name && <p className="text-red-400 text-sm pr-1 animate-in slide-in-from-top-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-300 text-base font-medium pr-1">رقم الهاتف</Label>
                                        <div className="relative group" dir="ltr">
                                            <div className="absolute left-4 top-3.5 flex items-center gap-2 pointer-events-none z-10"><span className="text-xl">🇮🇶</span><div className="h-6 w-[1px] bg-slate-700" /></div>
                                            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); if (val.length <= 11) setFormData({ ...formData, phone: val }) }} className={cn("h-14 bg-slate-950/50 border-slate-800 pl-16 text-lg text-left focus:ring-cyan-500/50 focus:border-cyan-500 transition-all rounded-xl tracking-widest font-mono", errors.phone && "border-red-500/50 focus:ring-red-500/20")} placeholder="0770 123 4567" />
                                            <Phone className="absolute right-4 top-4 text-slate-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            {errors.phone ? <p className="text-red-400 text-sm animate-in slide-in-from-top-1">{errors.phone}</p> : <p className="text-slate-500 text-xs">يجب أن يبدأ ب 07 ويتكون من 11 رقم</p>}
                                            <span className="text-slate-600 text-xs font-mono">{formData.phone.length}/11</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                            <h3 className="text-2xl font-bold text-white text-center mb-6">طريقة الدفع</h3>
                            <div className="grid gap-4">
                                <div onClick={() => setPaymentMethod("cash")} className={cn("relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-300 flex items-center justify-between group", paymentMethod === "cash" ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50" : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40")}>
                                    <div className="flex items-center gap-4"><div className={cn("p-3 rounded-xl", paymentMethod === "cash" ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400")}><Wallet className="w-6 h-6" /></div><div className="text-right"><h4 className={cn("font-bold text-lg", paymentMethod === "cash" ? "text-white" : "text-slate-300")}>الدفع نقداً</h4><p className="text-sm text-slate-500">الدفع عند الحضور للعيادة</p></div></div>
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", paymentMethod === "cash" ? "border-cyan-500 bg-cyan-500" : "border-slate-600")}>{paymentMethod === "cash" && <Check className="w-4 h-4 text-white" />}</div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/20 p-5 opacity-60 cursor-not-allowed flex items-center justify-between grayscale">
                                    <div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-slate-800 text-slate-500"><CreditCard className="w-6 h-6" /></div><div className="text-right"><h4 className="font-bold text-lg text-slate-400">الدفع الإلكتروني (زين كاش)</h4><p className="text-sm text-slate-500">غير متاح حالياً</p></div></div>
                                </div>
                                <div className="text-center"><span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">✨ احصل على 50 نقطة مكافأة عند الدفع الإلكتروني (قريباً)</span></div>
                            </div>
                            <Card className="glass-effect border-0 p-6 rounded-[24px] bg-slate-900/60 backdrop-blur-md shadow-xl ring-1 ring-white/5 mt-6">
                                <h4 className="text-slate-400 text-sm mb-4 font-bold border-b border-slate-800 pb-2">ملخص الحجز</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group"><span className="text-white font-medium group-hover:text-cyan-400 transition-colors">{formData.name}</span><span className="text-slate-500 text-sm">اسم المريض</span></div>
                                    <div className="flex justify-between items-center group"><span className="text-white font-mono text-sm">{date && format(date, 'yyyy-MM-dd')}</span><span className="text-slate-500 text-sm">التاريخ</span></div>
                                    <div className="flex justify-between items-center group"><span className="text-white font-mono text-sm bg-slate-800 px-2 py-0.5 rounded text-xs">{selectedTime}</span><span className="text-slate-500 text-sm">الوقت</span></div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/50 mt-2"><span className="text-xl font-bold text-cyan-400">{activeConfig.consultationPrice.toLocaleString()} د.ع</span><span className="text-slate-400">المجموع</span></div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500 relative perspective-1000">
                            <Card className="glass-effect border-0 p-8 md:p-12 rounded-[40px] text-center space-y-8 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_100px_rgba(8,145,178,0.2)] ring-1 ring-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-in zoom-in-50 duration-700 delay-150"><Check className="w-12 h-12 text-white drop-shadow-md" /></div>
                                    <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping opacity-20 delay-1000 duration-1000" />
                                </div>
                                <div className="space-y-2"><h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">تم الحجز بنجاح!</h3><p className="text-slate-400 text-lg font-medium">شكراً لك، {formData.name}</p></div>
                                <div className="py-2"><p className="text-slate-500 text-sm">تم تأكيد موعدك في <span className="text-cyan-400 font-bold mx-1">{date && format(date, 'yyyy-MM-dd')}</span> الساعة <span className="text-cyan-400 font-bold mx-1">{selectedTime}</span></p></div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-4 text-right mb-2">
                                    <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.1)] border border-cyan-500/20"><Camera className="w-6 h-6 animate-pulse" /></div><div><p className="text-white font-bold text-sm mb-1">يرجى التقاط صورة للشاشة</p><p className="text-slate-400 text-xs text-right">لضمان حقك عند المراجعة</p></div></div>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <Button className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95" onClick={() => { const text = `مرحباً، لقد قمت بحجز موعد باسم ${formData.name} في تاريخ ${date && format(date, 'yyyy-MM-dd')} الساعة ${selectedTime}.`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }}><Share2 className="w-5 h-5" />مشاركة عبر واتساب</Button>
                                    <Button variant="outline" className="w-full h-14 text-lg font-bold border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl transition-all" onClick={handleReset}>العودة للرئيسية</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons (only for step < 4) */}
                {step < 4 && (
                    <div className="flex justify-between items-center pt-8 border-t border-slate-800/50 mt-8">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack} className="h-12 px-8 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 gap-2">السابق</Button>
                        ) : (<div></div>)}
                        <Button onClick={handleNext} disabled={isSubmitting} className={cn("h-12 px-10 rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95", isSubmitting ? "opacity-70 cursor-wait" : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white")}>
                            {isSubmitting ? "جاري الحجز..." : step === 3 ? "تأكيد الحجز" : "التالي"}
                        </Button>
                    </div>
                )}

                {/* Error Modal */}
                <Dialog open={errorState.isOpen} onOpenChange={(v) => setErrorState({ ...errorState, isOpen: v })}>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-red-400">تنبيه</DialogTitle>
                            <DialogDescription className="text-slate-300">{errorState.message}</DialogDescription>
                        </DialogHeader>
                        <Button onClick={() => setErrorState({ ...errorState, isOpen: false })} className="bg-slate-800 hover:bg-slate-700 text-white">حسناً</Button>
                    </DialogContent>
                </Dialog>
            </div>
        );
    };

    return renderContent();
}
