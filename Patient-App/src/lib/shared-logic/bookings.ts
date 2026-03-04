import { prisma } from "../prisma";

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
            workingHours: { start: 10, end: 24 },
            patientsPerHour: 1,
            consultationPrice: 25000,
            slotDuration: 60
        };
    } catch (error) {
        console.error("fetchBookingConfig Error:", error);
        return {
            workingHours: { start: 10, end: 24 },
            patientsPerHour: 1,
            consultationPrice: 25000,
            slotDuration: 60
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
                    working_hours_schedule: doctor?.working_hours_schedule || null,
                    clinic_locations: doctor?.clinic_locations || []
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
            clinic_locations: (config as any).clinic_locations || []
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
        validationResults = await Promise.all([
            // 0. Subscription Check
            doctorId
                ? prisma.doctor.findUnique({ where: { id: doctorId }, select: { subscriptionStatus: true } })
                : prisma.doctor.findFirst({ select: { subscriptionStatus: true } }),

            // 1. Capacity Check logic (pre-computation)
            (async () => {
                const hourStart = new Date(startTime);
                hourStart.setMinutes(0, 0, 0);
                const hourEnd = new Date(hourStart);
                hourEnd.setHours(hourStart.getHours() + 1);
                return prisma.appointment.count({
                    where: {
                        status: { not: "CANCELLED" },
                        ...(doctorId ? { doctorId } : {}),
                        startTime: { gte: hourStart, lt: hourEnd }
                    }
                });
            })(),

            // 2. Blocked Time Check
            prisma.blockedTime.findFirst({
                where: {
                    ...(doctorId ? { doctorId } : {}),
                    startTime: { lte: startTime },
                    endTime: { gte: new Date(startTime.getTime() + config.slotDuration * 60000) }
                }
            }),

            // 3. Conflicting Appointment
            prisma.appointment.findFirst({
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

            // 5. Structural Day-Off Check
            doctorId
                ? prisma.doctor.findUnique({ where: { id: doctorId }, select: { disabledDaysOfWeek: true } })
                : prisma.doctor.findFirst({ select: { disabledDaysOfWeek: true } })
        ]);
    } catch (dbError) {
        console.error("Database connection or validation fetch failed:", dbError);
        return { success: false, message: "فشل الاتصال بقاعدة البيانات. يرجى التأكد من استقرار الخادم." };
    }

    const [statusResult, capacityCount, blocked, conflict, duplicate, dayOffData] = validationResults;
    const disabledDays = dayOffData?.disabledDaysOfWeek || [5];

    if (disabledDays.includes(startTime.getDay())) {
        return { success: false, message: "عذراً، العيادة مغلقة في هذا اليوم بشكل دائم." };
    }

    const subscriptionStatus = statusResult?.subscriptionStatus || "ACTIVE";
    if (subscriptionStatus === "EXPIRED" || subscriptionStatus === "DISABLED") {
        return { success: false, message: "عذراً، لا يمكن إتمام الحجز. اشتراك العيادة منتهي أو معطل." };
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + config.slotDuration);

    if (!isWithinWorkingHours(startTime, config.workingHours)) {
        return { success: false, message: "خارج ساعات العمل" };
    }

    if (capacityCount >= config.patientsPerHour) {
        return { success: false, message: "عذراً، تم الوصول للحد الأقصى من الحجوزات في هذه الساعة." };
    }

    if (blocked) {
        return { success: false, message: "عذراً، العيادة مغلقة في هذا الوقت." };
    }

    if (conflict) {
        return { success: false, message: "عذراً، هذا الموعد محجوز مسبقاً." };
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
