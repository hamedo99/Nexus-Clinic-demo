"use client"
import React from "react"
import { useRouter } from "next/navigation"
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
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User, Phone, Check, Wallet, CreditCard, Camera, Share2, AlertCircle, Building2, Loader2, MapPin } from "lucide-react"
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
    disabledDaysOfWeek: number[];
    locations: string[];
    schedule: any[];
    clinic_locations: any[];
}

export default function BookingForm({ config, doctorId, doctorName }: { config?: BookingConfig, doctorId?: string, doctorName?: string }) {
    // Prevent Hydration Errors on Vercel
    const [isMounted, setIsMounted] = React.useState(false)

    // State
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
    const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(undefined) // initialized in useEffect later
    const [step, setStep] = React.useState(1)
    const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [errorState, setErrorState] = React.useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: "" })
    const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "zain">("cash")
    const [availability, setAvailability] = React.useState<AvailabilityData>({ blockedPeriods: [], fullyBookedDates: [], fullSlots: {}, exactBookedSlots: {}, disabledDaysOfWeek: [5], locations: [], schedule: [], clinic_locations: [] })
    const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(false)
    const router = useRouter()

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

    const [formData, setFormData] = React.useState({ name: "", phone: "", website_url: "" })
    const [errors, setErrors] = React.useState({ name: "", phone: "" })

    // Default config if not provided
    const defaultConfig = {
        workingHours: { start: 10, end: 24 }, // 10 AM - 12 AM
        patientsPerHour: 4, // Falls back to 4 if doctor didn't configure it
        consultationPrice: 25000,
        slotDuration: 60,
        clinic_locations: [] as any[]
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
                setAvailability({
                    blockedPeriods: data.blockedPeriods || [],
                    fullyBookedDates: data.fullyBookedDates || [],
                    fullSlots: data.fullSlots || {},
                    exactBookedSlots: data.exactBookedSlots || {},
                    disabledDaysOfWeek: data.disabledDaysOfWeek || [5],
                    locations: data.locations || [],
                    schedule: data.schedule || [],
                    clinic_locations: data.clinic_locations || []
                });
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

        // Structural Weekly Day-Off check
        if (availability.disabledDaysOfWeek.includes(day.getDay())) return true;

        // NEW: Check if doctor works at this location on this day
        if (selectedLocation && availability.schedule && availability.schedule.length > 0) {
            const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const selectedDayName = dayNames[day.getDay()];
            const hasLocationThisDay = availability.schedule.some(s => s.location === selectedLocation && s.day === selectedDayName);
            if (!hasLocationThisDay) return true;
        }

        // Check if blocked
        for (const period of availability.blockedPeriods) {
            const start = new Date(period.start);
            const end = new Date(period.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            if (day >= start && day <= end) return true;
        }

        return false;
    }, [availability, selectedLocation]);

    // Dynamically generate time slots based on location schedule
    const timeSlots = React.useMemo(() => {
        if (!date || !selectedLocation) return [];

        const slots: { time: string, disabled: boolean, isFull: boolean, isPast: boolean, isBooked: boolean }[] = [];
        const dayStr = format(date, "yyyy-MM-dd");
        const fullHours = availability.fullSlots[dayStr] || [];
        const exactBooked = availability.exactBookedSlots?.[dayStr] || [];

        const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const selectedDayName = dayNames[date.getDay()];

        // Find all schedule ranges for this specific location today
        const ranges = availability.schedule.filter(s => s.location === selectedLocation && s.day === selectedDayName);

        if (ranges.length === 0) return [];

        const now = new Date();
        const isToday = isSameDay(date, now);
        const duration = activeConfig.slotDuration || 60;

        ranges.forEach(range => {
            const startH = parseInt(range.startTime.split(':')[0]);
            const endH = parseInt(range.endTime.split(':')[0]);

            let currentTime = new Date(date);
            currentTime.setHours(startH, 0, 0, 0);

            const rangeEndTime = new Date(date);
            rangeEndTime.setHours(endH, 0, 0, 0);

            while (currentTime < rangeEndTime) {
                const h = currentTime.getHours();
                const m = currentTime.getMinutes();

                const slotTimeStr24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const slotBookingsCount = exactBooked.filter((t: string) => t === slotTimeStr24).length;

                // Robust check for patientsPerHour Limit (Doctor Config > Global Config > 4)
                const limit = activeConfig?.patientsPerHour ?? 4;
                const isSlotExactBooked = slotBookingsCount >= limit;

                const isHourFull = fullHours.includes(h);
                const isPast = isToday && currentTime < now;

                const hour12 = h > 12 ? h - 12 : (h === 0 || h === 24 ? 12 : h);
                const ampm = h >= 12 && h < 24 ? "PM" : "AM";
                const timeString = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

                // Avoid duplicates if ranges overlap (though they shouldn't)
                if (!slots.some(s => s.time === timeString)) {
                    slots.push({
                        time: timeString,
                        disabled: isHourFull || isPast || isSlotExactBooked,
                        isFull: isHourFull,
                        isPast: isPast,
                        isBooked: isSlotExactBooked
                    });
                }
                currentTime.setMinutes(currentTime.getMinutes() + duration);
            }
        });

        return slots.sort((a, b) => {
            // Helper to sort "02:00 PM" vs "10:00 AM"
            const parse = (t: string) => {
                const [h_m, p] = t.split(' ');
                let [h, m] = h_m.split(':').map(Number);
                if (p === 'PM' && h < 12) h += 12;
                if (p === 'AM' && h === 12) h = 0;
                return h * 60 + m;
            };
            return parse(a.time) - parse(b.time);
        });
    }, [date, availability, selectedLocation]);

    const steps = [1, 2, 3, 4, 5, 6]

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
        if (step === 1 && selectedLocation) {
            setStep(2)
        } else if (step === 2 && date) {
            setStep(3)
        } else if (step === 3 && selectedTime) {
            setStep(4)
        } else if (step === 4 && validateStep2()) {
            if (!selectedTime || !date) {
                setErrorState({ isOpen: true, message: "يرجى اختيار الموعد أولاً" })
                return
            }
            setStep(5)
        } else if (step === 5) {
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
                if (formData.website_url) formDataToSend.append("website_url", formData.website_url);
                formDataToSend.append("date", format(date!, "yyyy-MM-dd"));
                formDataToSend.append("time", formatTimeForServer(selectedTime!));
                if (selectedLocation) formDataToSend.append("location", selectedLocation);
                if (doctorId) {
                    formDataToSend.append("doctorId", doctorId);
                }

                const result = await createBooking(null, formDataToSend)
                if (result.success) {
                    setStep(6)
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
    }, [step, date, selectedTime, formData, doctorId, validateStep2, triggerConfetti, selectedLocation]);

    const handleBack = React.useCallback(() => {
        if (step > 1) setStep(step - 1)
    }, [step]);

    const handleReset = React.useCallback(() => {
        setStep(1);
        setDate(new Date());
        setSelectedTime(null);
        setSelectedLocation(null);
        setFormData({ name: "", phone: "", website_url: "" });
    }, []);

    // Stable structure for hydration
    const renderContent = () => {
        if (!isMounted) {
            return <div className="w-full min-h-[400px] flex items-center justify-center"><div className="animate-pulse bg-slate-800/20 w-full h-[400px] rounded-[32px]"></div></div>;
        }

        const displayDate = date ? format(date, 'EEEE، d MMMM yyyy', { locale: arSA }) : '';
        const displayTime = selectedTime ? selectedTime.replace('AM', 'صباحاً').replace('PM', 'مساءً') : '';

        return (
            <div className="w-full relative">
                {/* Stepper */}
                <div className="flex justify-center items-center py-6 mb-8 w-full">
                    <div className="flex items-center w-full max-w-[360px] px-2" dir="rtl">
                        {steps.map((s, idx) => {
                            const isActive = step === s;
                            const isPast = step > s;
                            return (
                                <React.Fragment key={s}>
                                    <div className={cn(
                                        "w-[38px] h-[38px] md:w-[44px] md:h-[44px] shrink-0 rounded-full flex items-center justify-center text-sm md:text-[15px] font-medium transition-all duration-500 border bg-[#0f172a] relative z-10",
                                        isActive
                                            ? "border-[#06b6d4] text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-[#06b6d4]/20"
                                            : isPast
                                                ? "border-[#06b6d4]/40 text-[#06b6d4]/80"
                                                : "border-slate-800/80 text-slate-500"
                                    )}>
                                        {isPast ? <Check className="w-4 h-4 md:w-5 md:h-5 text-[#06b6d4]" /> : s}
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={cn("flex-1 h-px transition-colors duration-500 w-full min-w-[12px] -mx-1 relative z-0", isPast ? "bg-[#06b6d4]/40" : "bg-slate-800/80")} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px] relative">
                    {/* Step 1: Location Selection */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                            <div className="text-center space-y-2 mb-10">
                                <span className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{doctorName || "عيادة نكسس الكبرى"}</span>
                                <h3 className="text-3xl font-black text-white">اختر موقع العيادة</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pb-10">
                                {(() => {
                                    if (isLoadingAvailability) return null;

                                    // Use activeConfig for 0ms server-rendered locations
                                    const dbLocations = activeConfig.clinic_locations && activeConfig.clinic_locations.length > 0 ? activeConfig.clinic_locations : (availability.clinic_locations || []);
                                    const scheduleLocations = Array.from(new Set(availability.schedule.map(s => s.location)));

                                    // Use database locations if they exist, otherwise fallback to schedule locations
                                    const locationsToDisplay = dbLocations.length > 0
                                        ? dbLocations
                                        : scheduleLocations.map(name => ({ name }));

                                    return locationsToDisplay.map((locDetails: any, idx: number) => {
                                        const locName = locDetails.name || locDetails;
                                        return (
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedLocation(locName as string);
                                                    setStep(2);
                                                    setDate(undefined);
                                                    setSelectedTime(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setSelectedLocation(locName as string);
                                                        setStep(2);
                                                        setDate(undefined);
                                                        setSelectedTime(null);
                                                    }
                                                }}
                                                className={cn(
                                                    "group relative p-6 rounded-[32px] border-2 transition-all duration-500 text-right overflow-hidden flex flex-col gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                                                    selectedLocation === locName
                                                        ? "bg-cyan-600 border-cyan-400 shadow-[0_20px_40px_-15px_rgba(8,145,178,0.4)] scale-[1.02]"
                                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 hover:scale-[1.01]"
                                                )}
                                                dir="rtl"
                                            >
                                                <div className="relative z-10 flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 shrink-0",
                                                            selectedLocation === locName ? "bg-white/20 text-white" : "bg-cyan-900/30 text-cyan-400"
                                                        )}>
                                                            <Building2 className="w-6 h-6" />
                                                        </div>
                                                        <div className="space-y-1 text-right border-r-0">
                                                            <h4 className={cn("text-xl font-black whitespace-nowrap", selectedLocation === locName ? "text-white" : "text-slate-200")}>{locName as string}</h4>
                                                            <p className={cn("text-xs font-medium", selectedLocation === locName ? "text-white/70" : "text-slate-500")}>
                                                                {locDetails?.address || "فرع العيادة"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Map Pin Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (locDetails?.mapsUrl) {
                                                                window.open(locDetails.mapsUrl, '_blank');
                                                            } else if (locDetails?.lat && locDetails?.lng) {
                                                                window.open(`https://www.google.com/maps/search/?api=1&query=${locDetails.lat},${locDetails.lng}`, '_blank');
                                                            } else {
                                                                window.open(`https://maps.google.com/?q=${encodeURIComponent(locName as string)}`, '_blank');
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/40 hover:bg-cyan-900/40 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group/pin backdrop-blur-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] shrink-0 mt-1"
                                                    >
                                                        <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover/pin:text-cyan-300" />
                                                        <span className="text-[10px] font-bold text-slate-300 group-hover/pin:text-cyan-300 whitespace-nowrap">عرض الموقع</span>
                                                    </button>
                                                </div>

                                                {locDetails?.phone && (
                                                    <div className={cn("relative z-10 pt-4 border-t", selectedLocation === locName ? "border-white/10" : "border-slate-800")}>
                                                        <div className="flex items-center gap-2 justify-start text-sm">
                                                            <Phone className={cn("w-4 h-4 shrink-0", selectedLocation === locName ? "text-white/70" : "text-slate-500")} />
                                                            <span className={cn(selectedLocation === locName ? "text-white/90" : "text-slate-400")}>{locDetails.phone}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedLocation === locName && (
                                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-white/30" />
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                                {isLoadingAvailability ? (
                                    <div className="col-span-full py-20 flex justify-center items-center">
                                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                                    </div>
                                ) : (activeConfig.clinic_locations?.length === 0 && availability.clinic_locations?.length === 0 && availability.schedule?.length === 0) ? (
                                    <div className="col-span-full py-20 text-center">
                                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                                        <p className="text-slate-400">لا توجد مواقع عمل مسجلة حالياً</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date Selection */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-left-8 duration-500 w-full space-y-6 max-w-2xl mx-auto">
                            <div className="text-center space-y-2 mb-8">
                                <span className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{selectedLocation}</span>
                                <h3 className="text-3xl font-black text-white">اختر تاريخ الموعد</h3>
                            </div>

                            <Card className="glass-effect border-0 p-6 md:p-8 rounded-[32px] overflow-hidden flex flex-col items-center relative bg-slate-900/40 backdrop-blur-md shadow-xl ring-1 ring-white/5">
                                <div className="w-full flex justify-between items-center mb-6 px-2 ltr-force-header" dir="ltr">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></Button>
                                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></Button>
                                        {isLoadingAvailability && <div className="animate-spin text-cyan-500 ml-2"><Clock className="w-4 h-4" /></div>}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200 capitalize w-full text-right pr-4 tracking-wide">{currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: arSA }) : ''}</h3>
                                </div>
                                <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); if (d) setStep(3); }} month={currentMonth || new Date()} onMonthChange={setCurrentMonth} locale={arSA} className="p-0 pointer-events-auto rounded-md border-0 w-full calendar-ltr font-sans relative z-10"
                                    disabled={isDateDisabled}
                                    classNames={{ months: "w-full", month: "space-y-4 w-full", caption: "hidden", table: "w-full border-collapse space-y-2", weekdays: "flex justify-between w-full mb-4 px-2", weekday: "text-slate-500 rounded-md w-10 font-bold text-[0.75rem] uppercase tracking-wider", week: "flex w-full mt-2 justify-between px-2", day: "h-11 w-11 p-0 font-medium text-slate-400 aria-selected:opacity-100 hover:text-white hover:bg-slate-800 rounded-full transition-all flex items-center justify-center relative", selected: "bg-cyan-600 text-white hover:bg-cyan-600 hover:text-white shadow-lg shadow-cyan-900/50 font-bold scale-110 z-10", today: "text-cyan-400 font-bold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-cyan-400 after:rounded-full", outside: "text-slate-800 opacity-20", disabled: "text-slate-500 bg-slate-800/40 opacity-50 selection:bg-transparent hover:bg-transparent cursor-not-allowed", hidden: "invisible" }}
                                />

                                {/* Calendar Legend */}
                                <div className="w-full flex justify-center items-center gap-6 mt-6 pt-5 border-t border-slate-800/50" dir="rtl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                                        <span className="text-xs text-slate-400 font-medium">يوم متاح للحجز</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-700/80"></div>
                                        <span className="text-xs text-slate-400 font-medium">الطبيب غير متواجد</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full space-y-6 max-w-3xl mx-auto">
                            <div className="text-center space-y-2 mb-8">
                                <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-widest">
                                    <span>{selectedLocation}</span>
                                    <span>•</span>
                                    <span>{date && format(date, 'EEEE, d MMMM', { locale: arSA })}</span>
                                </div>
                                <h3 className="text-3xl font-black text-white">متى تفضل الحضور؟</h3>
                            </div>

                            <Card className="glass-effect border-0 p-8 rounded-[32px] flex flex-col min-h-[400px] relative overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-xl ring-1 ring-white/5">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
                                <div className="flex items-center gap-3 mb-8 relative z-10 text-right w-full justify-start" dir="rtl">
                                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(8,145,178,0.2)]"><Clock className="w-5 h-5" /></div>
                                    <h3 className="text-xl font-bold text-slate-200">الأوقات المتاحة</h3>
                                </div>

                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar relative z-10" dir="ltr">
                                    {timeSlots.map(({ time, disabled, isFull, isBooked, isPast }) => (
                                        <button
                                            key={time}
                                            onClick={() => {
                                                if (!disabled) {
                                                    setSelectedTime(time);
                                                    setStep(4);
                                                }
                                            }}
                                            disabled={disabled}
                                            className={cn("min-h-[60px] md:min-h-[68px] w-full px-2 rounded-[20px] text-center transition-all duration-300 border relative overflow-hidden group flex flex-col items-center justify-center gap-1",
                                                (isBooked || isFull) ?
                                                    "cursor-not-allowed bg-rose-500/10 border-rose-500/20 text-rose-400/90 shadow-inner"
                                                    : isPast ?
                                                        "opacity-40 cursor-not-allowed bg-slate-800/40 border-slate-700/50 text-slate-500 line-through decoration-slate-600"
                                                        : selectedTime === time ?
                                                            "bg-cyan-600 border-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] scale-[1.05] ring-2 ring-cyan-400/50"
                                                            : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white hover:shadow-md hover:scale-[1.02]"
                                            )}
                                        >
                                            <span className="relative z-10 font-sans tracking-widest block leading-none text-base md:text-lg font-bold">{time}</span>

                                            {/* Status Indicators */}
                                            {(isBooked || isFull) && <span className="text-[10px] md:text-xs font-bold text-rose-500/90 bg-rose-500/10 px-2 py-0.5 rounded-full">مكتمل</span>}
                                            {(!isBooked && !isFull && !isPast && selectedTime !== time) && <span className="text-[10px] md:text-xs font-medium text-cyan-500/70 group-hover:text-cyan-400 transition-colors">متاح للحجز</span>}
                                            {(selectedTime === time) && <span className="text-[10px] md:text-xs font-bold text-cyan-100 bg-white/20 px-2 py-0.5 rounded-full">تم الاختيار</span>}

                                            {selectedTime === time && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] translate-x-[-100%] animate-shimmer" />}
                                        </button>
                                    ))}
                                    {timeSlots.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">لا توجد أوقات متاحة لهذا اليوم في هذا الموقع</div>}
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 4 && (
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
                                        {/* Honeypot field for bot spam prevention */}
                                        <div className="opacity-0 absolute -z-10" aria-hidden="true">
                                            <Input tabIndex={-1} autoComplete="off" id="website_url" name="website_url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
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

                    {step === 5 && (
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
                            </div>
                            <Card className="glass-effect border-0 p-6 rounded-[24px] bg-slate-900/60 backdrop-blur-md shadow-xl ring-1 ring-white/5 mt-6">
                                <h4 className="text-slate-400 text-sm mb-4 font-bold border-b border-slate-800 pb-2">ملخص الحجز</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group"><span className="text-white font-medium group-hover:text-cyan-400 transition-colors">{formData.name}</span><span className="text-slate-500 text-sm">اسم المريض</span></div>
                                    <div className="flex justify-between items-center group"><span className="text-white font-medium text-sm">{displayDate}</span><span className="text-slate-500 text-sm">التاريخ</span></div>
                                    <div className="flex justify-between items-center group"><span className="text-cyan-400 font-bold text-sm bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-lg">{displayTime}</span><span className="text-slate-500 text-sm">الوقت</span></div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/50 mt-2"><span className="text-xl font-bold text-cyan-400">{activeConfig.consultationPrice.toLocaleString()} د.ع</span><span className="text-slate-400">المجموع</span></div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500 relative perspective-1000">
                            <Card className="glass-effect border-0 p-8 md:p-10 rounded-[40px] text-center space-y-6 bg-slate-900/90 backdrop-blur-xl shadow-[0_0_100px_rgba(8,145,178,0.2)] ring-1 ring-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

                                <div className="relative pt-2">
                                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-700 delay-150">
                                        <Check className="w-10 h-10 text-white drop-shadow-md" />
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-ping opacity-10 duration-1000" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">تم الحجز بنجاح!</h3>
                                    <p className="text-emerald-400 font-bold">موعدك الآن مؤكد في العيادة</p>
                                </div>

                                {/* Appointment Ticket UI */}
                                <div className="bg-slate-950/50 rounded-3xl border border-slate-800/80 overflow-hidden text-right shadow-inner">
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                                            <span className="text-white font-bold">{formData.name}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-2">المريض <User className="w-3.5 h-3.5" /></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                                            <span className="text-cyan-400 font-bold">{doctorName || "عيادة نكسس الكبرى"}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-2">الطبيب <User className="w-3.5 h-3.5 text-cyan-500" /></span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-b border-slate-800/50 pb-3">
                                            <div className="text-right">
                                                <span className="text-slate-500 text-[10px] flex items-center gap-1 justify-end mb-1">الوقت <Clock className="w-3 h-3" /></span>
                                                <span className="text-cyan-400 font-bold text-sm bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">{displayTime}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-slate-500 text-[10px] flex items-center gap-1 justify-end mb-1">التاريخ <CalendarIcon className="w-3 h-3" /></span>
                                                <span className="text-white font-medium text-sm">{displayDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                                            <span className="text-white font-mono font-bold text-sm">{formData.phone}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-2">رقم الهاتف <Phone className="w-3.5 h-3.5" /></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-bold text-sm">{selectedLocation}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-2">الموقع <Building2 className="w-3.5 h-3.5 text-cyan-500" /></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-bold text-sm">{paymentMethod === "cash" ? "نقداً في العيادة" : "زين كاش"}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-2">طريقة الدفع <Wallet className="w-3.5 h-3.5" /></span>
                                        </div>
                                    </div>
                                    <div className="bg-cyan-500/5 p-3 text-center border-t border-slate-800/50">
                                        <p className="text-cyan-400 text-xs font-bold italic tracking-wider">NEXUS CLINIC - DIGITAL TICKET</p>
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex items-center justify-between gap-4 text-right">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-xs mb-0.5">يرجى التقاط صورة للشاشة</p>
                                            <p className="text-slate-500 text-[10px]">لإظهار التذكرة عند مراجعة العيادة</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-[#128C7E] hover:bg-[#075E54] text-white rounded-2xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
                                        onClick={() => {
                                            const text = `*تأكيد حجز موعد - عيادة نكسس*\n\n` +
                                                `👤 *المريض:* ${formData.name}\n` +
                                                `👨‍⚕️ *الطبيب:* ${doctorName || "المناوب"}\n` +
                                                `📅 *التاريخ:* ${displayDate}\n` +
                                                `⏰ *الوقت:* ${displayTime}\n` +
                                                `📞 *الهاتف:* ${formData.phone}\n` +
                                                `💳 *طريقة الدفع:* ${paymentMethod === "cash" ? "نقداً في العيادة" : "إلكتروني"}\n\n` +
                                                `_يرجى الحضور قبل الموعد بـ 10 دقائق._`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        <Share2 className="w-5 h-5" />
                                        مشاركة عبر واتساب
                                    </Button>
                                    <Button variant="ghost" className="w-full h-12 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-bold" onClick={() => {
                                        const path = window.location.pathname;
                                        const doctorUrl = path.endsWith('/book') ? path.replace('/book', '') : path;
                                        router.push(doctorUrl);
                                    }}>
                                        العودة لصفحة الطبيب
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons (only for step < 6) */}
                {step < 6 && (
                    <div className="flex justify-between items-center pt-8 border-t border-slate-800/50 mt-8">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack} className="h-12 px-8 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 gap-2">السابق</Button>
                        ) : (<div></div>)}
                        <Button onClick={handleNext} disabled={isSubmitting || (step === 1 && !selectedLocation) || (step === 2 && !date) || (step === 3 && !selectedTime)} className={cn("h-12 px-10 rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95", isSubmitting ? "opacity-70 cursor-wait bg-cyan-600/50" : "bg-cyan-500 hover:bg-cyan-400 text-white")}>
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري الحجز...</span>
                                </div>
                            ) : step === 5 ? "تأكيد الحجز" : "التالي"}
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
