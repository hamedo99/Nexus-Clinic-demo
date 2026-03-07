import { prisma } from "./db";

/**
 * Fetches global booking configuration from settings.
 */
export async function fetchBookingConfig() {
    try {
        const keys = ["working_hours", "patients_per_hour", "consultation_price", "slot_duration"];
        const settings = await prisma.setting.findMany({
            where: { key: { in: keys } },
        });

        const configMap: Record<string, any> = {};
        settings.forEach((s: any) => configMap[s.key] = s.value);

        return {
            workingHours: configMap["working_hours"] || { start: 14, end: 21 },
            patientsPerHour: typeof configMap["patients_per_hour"] === 'number' ? configMap["patients_per_hour"] : 4,
            consultationPrice: typeof configMap["consultation_price"] === 'number' ? configMap["consultation_price"] : 25000,
            slotDuration: typeof configMap["slot_duration"] === 'number' ? configMap["slot_duration"] : 20
        };
    } catch (error) {
        console.error("fetchBookingConfig Error:", error);
        return {
            workingHours: { start: 14, end: 21 },
            patientsPerHour: 4,
            consultationPrice: 25000,
            slotDuration: 20
        };
    }
}

/**
 * Calculates availability for a given month and doctor.
 */
export async function fetchMonthAvailability(
    year: number,
    month: number,
    doctorId?: string,
    options?: {
        patientsPerHour?: number;
        workingHours?: { start: number, end: number };
        slotDuration?: number;
        disabledDaysOfWeek?: number[];
        working_hours_schedule?: any;
        clinic_locations?: any;
    }
) {
    try {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Fetch blocked dates
        const blockedTimes = await prisma.blockedTime.findMany({
            where: {
                ...(doctorId ? { doctorId } : {}),
                OR: [
                    { startTime: { gte: startOfMonth, lte: endOfMonth } },
                    { endTime: { gte: startOfMonth, lte: endOfMonth } },
                    { startTime: { lte: startOfMonth }, endTime: { gte: endOfMonth } }
                ]
            },
        });

        // Fetch appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                ...(doctorId ? { doctorId } : {}),
                startTime: { gte: startOfMonth, lte: endOfMonth },
                status: { not: "CANCELLED" },
            },
        });

        // Use provided options or fetch defaults
        let config = options;

        if (!config) {
            const globalConfig = await fetchBookingConfig();
            if (doctorId) {
                const doctor = await prisma.doctor.findUnique({
                    where: { id: doctorId },
                    select: { patientsPerHour: true, workingHours: true, disabledDaysOfWeek: true, working_hours_schedule: true, clinic_locations: true }
                });
                config = {
                    patientsPerHour: doctor?.patientsPerHour || globalConfig.patientsPerHour,
                    workingHours: (doctor?.workingHours as any) || globalConfig.workingHours,
                    slotDuration: globalConfig.slotDuration,
                    disabledDaysOfWeek: doctor?.disabledDaysOfWeek || [5],
                    working_hours_schedule: (doctor as any)?.working_hours_schedule || null,
                    clinic_locations: (doctor as any)?.clinic_locations || []
                };
            } else {
                config = { ...globalConfig, disabledDaysOfWeek: [5] };
            }
        }

        const { patientsPerHour, workingHours, disabledDaysOfWeek, working_hours_schedule } = config as any;

        const schedule = working_hours_schedule?.slots || [];
        const locations = Array.from(new Set(schedule.map((s: any) => s.location).filter(Boolean))) as string[];

        const bookedSlots: Record<string, Record<string, number>> = {};
        const dailyCounts: Record<string, number> = {};
        const exactBookedSlots: Record<string, string[]> = {};

        appointments.forEach((app: any) => {
            const date = new Date(app.startTime);
            const year = date.getFullYear();
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            const dayStrPart = String(date.getDate()).padStart(2, '0');
            const dayStr = `${year}-${monthStr}-${dayStrPart}`;
            const hour = date.getHours();

            if (!bookedSlots[dayStr]) bookedSlots[dayStr] = {};
            if (!bookedSlots[dayStr][hour]) bookedSlots[dayStr][hour] = 0;
            if (!exactBookedSlots[dayStr]) exactBookedSlots[dayStr] = [];

            const m = date.getMinutes();
            const timeStr = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            exactBookedSlots[dayStr].push(timeStr);

            bookedSlots[dayStr][hour]++;
            dailyCounts[dayStr] = (dailyCounts[dayStr] || 0) + 1;
        });

        const fullyBookedDates: string[] = [];
        Object.keys(dailyCounts).forEach((day: any) => {
            let isFull = true;
            for (let h = (workingHours?.start || 10); h < (workingHours?.end || 24); h++) {
                const count = bookedSlots[day]?.[h] || 0;
                if (count < (patientsPerHour || 1)) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) fullyBookedDates.push(day);
        });

        const fullSlots: Record<string, number[]> = {};
        Object.keys(bookedSlots).forEach((day: any) => {
            fullSlots[day] = [];
            for (let h = (workingHours?.start || 10); h < (workingHours?.end || 24); h++) {
                if ((bookedSlots[day][h] || 0) >= (patientsPerHour || 1)) {
                    fullSlots[day].push(h);
                }
            }
        });

        return {
            blockedPeriods: blockedTimes.map((b: any) => ({ start: b.startTime, end: b.endTime, reason: b.reason })),
            fullyBookedDates,
            fullSlots,
            exactBookedSlots,
            disabledDaysOfWeek: disabledDaysOfWeek || [5],
            locations,
            schedule,
            clinic_locations: (config as any)?.clinic_locations || []
        };
    } catch (error) {
        console.error("fetchMonthAvailability Error:", error);
        return { blockedPeriods: [], fullyBookedDates: [], fullSlots: {}, exactBookedSlots: {} };
    }
}

/**
 * Centralized logic for creating a booking with all validations.
 */
export async function validateAndCreateBooking(data: {
    patientName: string;
    patientPhone: string;
    startTime: Date;
    doctorId?: string;
    location?: string;
}) {
    const { patientName, patientPhone, startTime, doctorId, location } = data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const config = await fetchBookingConfig();

    let validationResults;
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        validationResults = await Promise.all([
            // 0. Doctor General Validation (Subscription & Days Off)
            doctorId
                ? prisma.doctor.findUnique({ where: { id: doctorId }, select: { subscriptionStatus: true, disabledDaysOfWeek: true, patientsPerHour: true } })
                : prisma.doctor.findFirst({ select: { subscriptionStatus: true, disabledDaysOfWeek: true, patientsPerHour: true } }),

            // 1. Capacity Check logic (pre-computation)
            prisma.appointment.count({
                where: {
                    status: { not: "CANCELLED" },
                    ...(doctorId ? { doctorId } : {}),
                    startTime: { gte: new Date(startTime.getTime() - (startTime.getTime() % 3600000)), lt: new Date(startTime.getTime() - (startTime.getTime() % 3600000) + 3600000) }
                }
            }),

            // 2. Blocked Time Check
            prisma.blockedTime.findFirst({
                where: {
                    ...(doctorId ? { doctorId } : {}),
                    startTime: { lte: startTime },
                    endTime: { gte: new Date(startTime.getTime() + config.slotDuration * 60000) }
                }
            }),

            // 3. Conflicting Appointments Count
            prisma.appointment.count({
                where: {
                    status: { not: "CANCELLED" },
                    ...(doctorId ? { doctorId } : {}),
                    AND: [
                        { startTime: { lt: new Date(startTime.getTime() + config.slotDuration * 60000) } },
                        { endTime: { gt: startTime } }
                    ]
                }
            }),

            // 4. Duplicate Prevention
            prisma.appointment.findFirst({
                where: {
                    patient: { phoneNumber: patientPhone },
                    ...(doctorId ? { doctorId } : {}),
                    status: { not: "CANCELLED" },
                    startTime: { gte: today }
                }
            }),

            // 5. Anti-Spam: Block if same phone booked within last 2 hours
            prisma.appointment.findFirst({
                where: {
                    patient: { phoneNumber: patientPhone },
                    createdAt: { gte: twoHoursAgo }
                }
            }),

            // 6. Active Load Limit: Max 2 upcoming active bookings
            prisma.appointment.count({
                where: {
                    patient: { phoneNumber: patientPhone },
                    status: { in: ["PENDING", "CONFIRMED"] },
                    startTime: { gte: today }
                }
            })
        ]);
    } catch (dbError) {
        console.error("Database connection or validation fetch failed:", dbError);
        return { success: false, message: "فشل الاتصال بقاعدة البيانات. يرجى التأكد من استقرار الخادم." };
    }

    const [doctorData, capacityCount, blocked, conflictCount, duplicate, recentBooking, activeBookingsCount] = validationResults;
    const disabledDays = (doctorData as any)?.disabledDaysOfWeek || [5];
    const activePatientsPerHour = (doctorData as any)?.patientsPerHour || config.patientsPerHour || 1;

    if (recentBooking) {
        return { success: false, message: "عذراً، لقد قمت بحجز موعد مؤخراً. يرجى الانتظار قليلاً أو الاتصال بالعيادة." };
    }

    if (activeBookingsCount >= 2) {
        return { success: false, message: "عذراً، لديك بالفعل موعدين نشطين قادمين. لا يمكنك حجز المزيد حالياً." };
    }

    if (disabledDays.includes(startTime.getDay())) {
        return { success: false, message: "عذراً، العيادة مغلقة في هذا اليوم بشكل دائم." };
    }

    const subscriptionStatus = (doctorData as any)?.subscriptionStatus || "ACTIVE";
    if (subscriptionStatus === "EXPIRED" || subscriptionStatus === "DISABLED") {
        return { success: false, message: "عذراً، لا يمكن إتمام الحجز. اشتراك العيادة منتهي أو معطل." };
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + config.slotDuration);

    if (!isWithinWorkingHours(startTime, config.workingHours)) {
        return { success: false, message: "خارج ساعات العمل" };
    }

    if (capacityCount >= activePatientsPerHour) {
        return { success: false, message: "عذراً، تم الوصول للحد الأقصى من الحجوزات في هذه الساعة." };
    }

    if (blocked) {
        return { success: false, message: "عذراً، العيادة مغلقة في هذا الوقت." };
    }

    if (conflictCount >= activePatientsPerHour) {
        return { success: false, message: "عذراً، هذا الموعد تم حجزه بالكامل." };
    }

    if (duplicate) {
        return { success: false, message: "عذراً، لديك حجز نشط مسبقاً." };
    }

    try {
        const patient = await prisma.patient.upsert({
            where: { phoneNumber: patientPhone },
            update: { fullName: patientName, doctorId: doctorId },
            create: { fullName: patientName, phoneNumber: patientPhone, doctorId: doctorId }
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                startTime,
                endTime,
                status: "PENDING",
                doctorId: doctorId,
                clinicLocation: location
            }
        });

        return { success: true, data: appointment };
    } catch (error) {
        console.error("validateAndCreateBooking Error:", error);
        return { success: false, message: "حدث خطأ في قاعدة البيانات." };
    }
}

function isWithinWorkingHours(startTime: Date, workingHours: { start: number, end: number }) {
    const hour = startTime.getHours();
    return hour >= workingHours.start && hour < workingHours.end;
}
